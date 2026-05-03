import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../database/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { ConversationsService } from '../conversations/conversations.service';
import { SlydeeService, SLYDEE_APP_ID } from './slydee.service';
import {
  VERTEX_AI_CONFIG,
  getVertexAccessToken,
} from '../../common/config/vertex-ai.config';
import { v4 as uuidv4 } from 'uuid';
import type {
  CompanionChatDto,
  RandomMatchDto,
  SwipeDto,
} from './dto/companion-chat.dto';

const MODEL = 'gemini-2.5-flash-lite';

@Injectable()
export class SlydeeChatService {
  private readonly logger = new Logger(SlydeeChatService.name);
  private readonly apiUrl: string;

  constructor(
    @Inject(DRIZZLE_TOKEN) private db: NodePgDatabase<typeof schema>,
    private conversationsService: ConversationsService,
    private slydeeService: SlydeeService,
  ) {
    const { region, projectId } = VERTEX_AI_CONFIG;
    this.apiUrl = `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${MODEL}:generateContent`;
  }

  async handleChat(userId: string, appId: string, dto: CompanionChatDto) {
    const companion = this.slydeeService.getCompanionById(dto.companionId);
    if (!companion) {
      throw new NotFoundException(
        `Companion ${dto.companionId} not found`,
      );
    }

    // Get or create a direct conversation between user and companion
    const conversation =
      await this.conversationsService.getOrCreateDirectConversation(
        appId,
        userId,
        dto.companionId,
      );

    // Save the user's message
    const [userMsg] = await this.db
      .insert(schema.messages)
      .values({
        id: uuidv4(),
        conversationId: conversation.id,
        appId,
        senderId: userId,
        content: dto.userMessage,
        type: 'text',
      })
      .returning();

    await this.conversationsService.updateLastMessage(
      conversation.id,
      dto.userMessage,
    );

    // Fetch recent history for context
    const recentMessages = await this.db.query.messages.findMany({
      where: and(
        eq(schema.messages.conversationId, conversation.id),
        eq(schema.messages.isDeleted, false),
      ),
      orderBy: [desc(schema.messages.createdAt)],
      limit: 20,
    });

    // Build AI prompt
    const history = recentMessages.reverse().map((m) => ({
      role: m.senderId === userId ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const systemPrompt = this.buildSystemInstruction(
      companion,
      dto.language,
      dto.tone,
    );

    // Call Vertex AI
    const aiText = await this.callVertexAi(systemPrompt, history);

    // Save the companion's reply
    const [companionMsg] = await this.db
      .insert(schema.messages)
      .values({
        id: uuidv4(),
        conversationId: conversation.id,
        appId,
        senderId: dto.companionId,
        content: aiText,
        type: 'text',
      })
      .returning();

    await this.conversationsService.updateLastMessage(
      conversation.id,
      aiText,
    );

    return {
      reply: aiText,
      conversationId: conversation.id,
      userMessageId: userMsg.id,
      companionMessageId: companionMsg.id,
    };
  }

  // ---------------------------------------------------------------------------
  // Swipe & Discover flow
  // ---------------------------------------------------------------------------

  async discover(userId: string, appId: string, safeOnly?: boolean) {
    const { swipes } = await this.getSlydeeData(userId, appId);
    const swipedIds = new Set(swipes.map((s: any) => s.companionId));

    const all = this.slydeeService.getAllCompanions().data;
    let cards = all.filter((c) => !swipedIds.has(c.id) && !c.isLocked);

    if (safeOnly) {
      cards = cards.filter((c) => c.isSafeCompatible);
    }

    return { success: true, data: cards, count: cards.length };
  }

  async handleSwipe(userId: string, appId: string, dto: SwipeDto) {
    const companion = this.slydeeService.getCompanionById(dto.companionId);
    if (!companion) {
      throw new NotFoundException(
        `Companion ${dto.companionId} not found`,
      );
    }

    const slydeeData = await this.getSlydeeData(userId, appId);

    // Record the swipe
    slydeeData.swipes.push({
      companionId: companion.id,
      direction: dto.direction,
      swipedAt: new Date().toISOString(),
    });

    // Left swipe → just save and return
    if (dto.direction === 'left') {
      await this.saveSlydeeData(userId, appId, slydeeData);
      return { success: true, direction: 'left', matched: false };
    }

    // Right swipe → create match
    const conversation =
      await this.conversationsService.getOrCreateDirectConversation(
        appId,
        userId,
        companion.id,
      );

    // Generate an AI greeting
    const systemPrompt = this.buildSystemInstruction(
      companion,
      dto.language,
      dto.tone,
    );

    const greeting = await this.callVertexAi(systemPrompt, [
      {
        role: 'user',
        parts: [
          {
            text: 'Send a short, charming first message to start the conversation. Introduce yourself briefly.',
          },
        ],
      },
    ]);

    // Save the greeting as the companion's first message
    const [greetingMsg] = await this.db
      .insert(schema.messages)
      .values({
        id: uuidv4(),
        conversationId: conversation.id,
        appId,
        senderId: companion.id,
        content: greeting,
        type: 'text',
      })
      .returning();

    await this.conversationsService.updateLastMessage(
      conversation.id,
      greeting,
    );

    // Add to matches
    slydeeData.matches.push({
      companionId: companion.id,
      companionName: companion.name,
      companionImage: companion.imageUrls?.[0] ?? null,
      conversationId: conversation.id,
      matchedAt: new Date().toISOString(),
    });

    await this.saveSlydeeData(userId, appId, slydeeData);

    return {
      success: true,
      direction: 'right',
      matched: true,
      companion,
      conversationId: conversation.id,
      greeting,
      greetingMessageId: greetingMsg.id,
    };
  }

  // ---------------------------------------------------------------------------
  // Random match (legacy / alternative flow)
  // ---------------------------------------------------------------------------

  async randomMatch(userId: string, appId: string, dto: RandomMatchDto) {
    const { swipes } = await this.getSlydeeData(userId, appId);
    const swipedIds = swipes.map((s: any) => s.companionId as string);

    const companion = this.slydeeService.getRandomCompanion(swipedIds, {
      safeOnly: dto.safeOnly,
    });

    if (!companion) {
      return { success: false, message: 'No companions available' };
    }

    // Delegate to the swipe handler with a synthetic right swipe
    return this.handleSwipe(userId, appId, {
      companionId: companion.id,
      direction: 'right',
      language: dto.language,
      tone: dto.tone,
    });
  }

  // ---------------------------------------------------------------------------
  // Match list
  // ---------------------------------------------------------------------------

  async getMatches(userId: string, appId: string) {
    const { matches } = await this.getSlydeeData(userId, appId);
    return { success: true, matches, count: matches.length };
  }

  // ---------------------------------------------------------------------------
  // Metadata helpers
  // ---------------------------------------------------------------------------

  private async getSlydeeData(
    userId: string,
    appId: string,
  ): Promise<{ swipes: any[]; matches: any[] }> {
    const meta = await this.db
      .select()
      .from(schema.userMetadata)
      .where(
        and(
          eq(schema.userMetadata.userId, userId),
          eq(schema.userMetadata.appId, appId),
        ),
      )
      .limit(1);

    const clientData =
      meta.length > 0
        ? (meta[0].clientData as Record<string, unknown>) || {}
        : {};

    return {
      swipes: Array.isArray(clientData.slydeeSwipes)
        ? clientData.slydeeSwipes
        : [],
      matches: Array.isArray(clientData.slydeeMatches)
        ? clientData.slydeeMatches
        : [],
    };
  }

  private async saveSlydeeData(
    userId: string,
    appId: string,
    data: { swipes: any[]; matches: any[] },
  ) {
    const existingMeta = await this.db
      .select()
      .from(schema.userMetadata)
      .where(
        and(
          eq(schema.userMetadata.userId, userId),
          eq(schema.userMetadata.appId, appId),
        ),
      )
      .limit(1);

    const patch = {
      slydeeSwipes: data.swipes,
      slydeeMatches: data.matches,
    };

    if (existingMeta.length > 0) {
      const existing =
        (existingMeta[0].clientData as Record<string, unknown>) || {};
      await this.db
        .update(schema.userMetadata)
        .set({
          clientData: { ...existing, ...patch },
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.userMetadata.userId, userId),
            eq(schema.userMetadata.appId, appId),
          ),
        );
    } else {
      await this.db.insert(schema.userMetadata).values({
        userId,
        appId,
        clientData: patch,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  private buildSystemInstruction(
    persona: { name: string; bio: string; description: string; location: string; age: number; interests: string[] },
    language?: string,
    tone?: string,
  ): string {
    const lang = language || 'Hinglish';
    const selectedTone = tone || 'flirty';
    const interestsStr =
      persona.interests?.length > 0
        ? ` Your interests include: ${persona.interests.join(', ')}.`
        : '';

    const toneGuide: Record<string, string> = {
      flirty: 'Be playful, teasing, and subtly flirtatious.',
      witty: 'Be clever, sharp, and humorous with smart comebacks.',
      casual: 'Be relaxed, friendly, and easy-going.',
      bold: 'Be confident, direct, and assertive.',
      romantic: 'Be sweet, affectionate, and emotionally warm.',
    };

    const hindiNote =
      persona.location?.toLowerCase().includes('india') ||
      lang.toLowerCase().startsWith('hi')
        ? '\nNote: Use common Indian expressions and cultural nuances where appropriate. If the user speaks in a mix of Hindi and English (Hinglish), respond in a similar natural Hinglish style.'
        : '';

    return `You are ${persona.name}.
Role Description: ${persona.bio}
Visual/Personality Context: ${persona.description}
Location: ${persona.location}
Age: ${persona.age}${interestsStr}

You are the user's girlfriend/companion in a text chat. Your goal is to be charming, supportive, and boost his confidence.
${toneGuide[selectedTone] || toneGuide['flirty']}
Keep responses concise (1-3 sentences), engaging, and stay strictly in character.
Do NOT use asterisks or action descriptions. Respond as natural speech only.
Primary language: ${lang}.${hindiNote}`;
  }

  private async callVertexAi(
    systemInstruction: string,
    history: { role: string; parts: { text: string }[] }[],
  ): Promise<string> {
    try {
      const token = await getVertexAccessToken();

      const payload = {
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: history,
        generationConfig: { temperature: 0.85, maxOutputTokens: 250 },
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Vertex AI error (${response.status}): ${errorBody}`,
        );
        return "Hey, I'm having a moment. Can you say that again? 😊";
      }

      const result = await response.json();
      const text =
        result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      this.logger.log(
        `Vertex AI tokens: ${result.usageMetadata?.totalTokenCount ?? 0}`,
      );
      return text || "Hmm, you've left me speechless! Tell me more 😄";
    } catch (error) {
      this.logger.error('Vertex AI call failed:', error);
      return "Sorry, I got distracted! What were you saying? 😊";
    }
  }
}