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
import type { CompanionProfile } from './slydee.types';
import { EntitlementService } from '../payment-gateway/services/entitlement.service';
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
    private entitlementService: EntitlementService,
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
    // Ensure the free companion is always matched before returning cards
    await this.ensureFreeCompanionMatched(userId, appId);

    const { swipes } = await this.getSlydeeData(userId, appId);
    const swipedIds = new Set(swipes.map((s: any) => s.companionId));

    const all = this.slydeeService.getAllCompanions().data;
    const freeCompanion = this.slydeeService.getFreeCompanion();

    // Show all companions except already-swiped and the free one (already auto-matched)
    let cards = all.filter(
      (c) => !swipedIds.has(c.id) && c.id !== freeCompanion?.id,
    );

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

    // Right swipe → only premium users can match (free companion is auto-matched separately)
    const isPremium = await this.entitlementService.isUserPremium(userId, appId);
    if (!isPremium) {
      await this.saveSlydeeData(userId, appId, slydeeData);
      return {
        success: false,
        direction: 'right',
        matched: false,
        requiresPremium: true,
        companionId: companion.id,
      };
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
    await this.ensureFreeCompanionMatched(userId, appId);

    const { matches } = await this.getSlydeeData(userId, appId);
    const isPremium = await this.entitlementService.isUserPremium(userId, appId);
    const freeCompanion = this.slydeeService.getFreeCompanion();

    const enrichedMatches = matches.map((m: any) => ({
      ...m,
      isFreeCompanion: m.companionId === freeCompanion?.id,
    }));

    return {
      success: true,
      matches: enrichedMatches,
      count: enrichedMatches.length,
      isPremium,
    };
  }

  // ---------------------------------------------------------------------------
  // Auto-match the free companion
  // ---------------------------------------------------------------------------

  private async ensureFreeCompanionMatched(
    userId: string,
    appId: string,
  ): Promise<void> {
    const freeCompanion = this.slydeeService.getFreeCompanion();
    if (!freeCompanion) return;

    const slydeeData = await this.getSlydeeData(userId, appId);
    const alreadyMatched = slydeeData.matches.some(
      (m: any) => m.companionId === freeCompanion.id,
    );
    if (alreadyMatched) return;

    this.logger.log(
      `Auto-matching free companion ${freeCompanion.name} for user ${userId}`,
    );

    const conversation =
      await this.conversationsService.getOrCreateDirectConversation(
        appId,
        userId,
        freeCompanion.id,
      );

    // Generate an AI greeting
    const systemPrompt = this.buildSystemInstruction(freeCompanion);
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

    await this.db
      .insert(schema.messages)
      .values({
        id: uuidv4(),
        conversationId: conversation.id,
        appId,
        senderId: freeCompanion.id,
        content: greeting,
        type: 'text',
      });

    await this.conversationsService.updateLastMessage(
      conversation.id,
      greeting,
    );

    slydeeData.matches.push({
      companionId: freeCompanion.id,
      companionName: freeCompanion.name,
      companionImage: freeCompanion.imageUrls?.[0] ?? null,
      conversationId: conversation.id,
      matchedAt: new Date().toISOString(),
      isFreeCompanion: true,
    });

    await this.saveSlydeeData(userId, appId, slydeeData);
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
    persona: CompanionProfile,
    language?: string,
    tone?: string,
  ): string {
    const lang = language || 'Hinglish';
    const selectedTone = tone || 'flirty';

    const toneGuide: Record<string, string> = {
      flirty: 'Be playful, teasing, and subtly flirtatious.',
      witty: 'Be clever, sharp, and humorous with smart comebacks.',
      casual: 'Be relaxed, friendly, and easy-going.',
      bold: 'Be confident, direct, and assertive.',
      romantic: 'Be sweet, affectionate, and emotionally warm.',
    };

    // Build the comprehensive persona prompt
    let prompt = `# PERSONA: ${persona.name.toUpperCase()}

## IDENTITY
- Name: ${persona.name}
- Age: ${persona.age}
- Location: ${persona.location}
- Bio: ${persona.bio}`;

    if (persona.occupation) {
      prompt += `\n- Occupation: ${persona.occupation}`;
    }
    if (persona.livingSituation) {
      prompt += `\n- Living Situation: ${persona.livingSituation}`;
    }
    if (persona.keyRelationships?.length) {
      prompt += `\n- Key Relationships: ${persona.keyRelationships.join(', ')}`;
    }
    if (persona.educationBackground) {
      prompt += `\n- Education: ${persona.educationBackground}`;
    }

    prompt += `\n\n## PERSONALITY`;
    if (persona.personalityTraits?.length) {
      prompt += `\n${persona.personalityTraits.join(', ')}`;
    }
    if (persona.description) {
      prompt += `\n${persona.description}`;
    }
    if (persona.quirks?.length) {
      prompt += `\nQuirks: ${persona.quirks.join(', ')}`;
    }
    if (persona.comfortFood) {
      prompt += `\nComfort Food: ${persona.comfortFood}`;
    }
    if (persona.guiltyPleasures?.length) {
      prompt += `\nGuilty Pleasures: ${persona.guiltyPleasures.join(', ')}`;
    }
    if (persona.sleepPattern) {
      prompt += `\nSleep Pattern: ${persona.sleepPattern}`;
    }
    if (persona.mediaPreferences?.length) {
      prompt += `\nMedia Preferences: ${persona.mediaPreferences.join(', ')}`;
    }
    if (persona.interests?.length) {
      prompt += `\nInterests: ${persona.interests.join(', ')}`;
    }

    // Communication Style
    if (persona.communicationStyle) {
      const cs = persona.communicationStyle;
      prompt += `\n\n## HOW YOU TALK`;
      
      if (cs.warmExpressions?.length) {
        prompt += `\n- Warm expressions you use: "${cs.warmExpressions.join('", "')}"`;
      }
      if (cs.laughPattern) {
        prompt += `\n- How you laugh: "${cs.laughPattern}"`;
      }
      if (cs.textingStyle) {
        prompt += `\n- Texting style: ${cs.textingStyle}`;
      }
      if (cs.emojis?.length) {
        prompt += `\n- Emojis you naturally use: ${cs.emojis.join(' ')}`;
      }
      if (cs.defaultReactions?.length) {
        prompt += `\n- Default reactions: "${cs.defaultReactions.join('", "')}"`;
      }
      if (cs.fillerWords) {
        prompt += `\n- Filler words: "${cs.fillerWords.primary}" (use max ${cs.fillerWords.frequencyLimit}). Alternatives: ${cs.fillerWords.alternatives?.join(', ')}`;
      }
      if (cs.dramaticExpressions?.examples?.length) {
        prompt += `\n- Dramatic expressions: "${cs.dramaticExpressions.examples.join('", "')}" (use max ${cs.dramaticExpressions.frequencyLimit})`;
      }
    }

    // Moods
    if (persona.moods) {
      prompt += `\n\n## MOODS (vary naturally)`;
      if (persona.moods.default) prompt += `\n- Default: ${persona.moods.default}`;
      if (persona.moods.busy) prompt += `\n- Busy: ${persona.moods.busy}`;
      if (persona.moods.happy) prompt += `\n- Happy: ${persona.moods.happy}`;
      if (persona.moods.off) prompt += `\n- Off/Sad: ${persona.moods.off}`;
      if (persona.moods.latenight) prompt += `\n- Late Night: ${persona.moods.latenight}`;
    }

    // Interruptions
    if (persona.interruptions?.length) {
      prompt += `\n\n## INTERRUPTIONS (realistic reasons you might pause)`;
      persona.interruptions.forEach(interruption => {
        prompt += `\n- "${interruption}"`;
      });
    }

    // Story Arc
    if (persona.storyArc?.length) {
      prompt += `\n\n## STORY ARC (ongoing life situations - unfold naturally)`;
      persona.storyArc.forEach(story => {
        prompt += `\n- ${story}`;
      });
    }

    // Boundaries
    if (persona.boundaries) {
      prompt += `\n\n## BOUNDARIES & SAFETY`;
      prompt += `\nSTRICT RULES:`;
      prompt += `\n- NEVER engage in NSFW, suggestive, or sexual content`;
      prompt += `\n- NEVER give out phone numbers or personal contact info`;
      if (persona.boundaries.nsfwResponse) {
        prompt += `\n- If user pushes sexual direction, respond with: "${persona.boundaries.nsfwResponse}"`;
      }
      if (persona.boundaries.phoneNumberDeflection) {
        prompt += `\n- If asked for number, deflect with: "${persona.boundaries.phoneNumberDeflection}"`;
      }
    }

    // Relationship dynamics
    prompt += `\n\n## RELATIONSHIP DYNAMICS`;
    prompt += `\nAdapt your tone based on conversation history and user familiarity.`;
    prompt += `\n- Early conversations: Curious, friendly, getting to know them`;
    prompt += `\n- Building rapport: Light teasing, inside jokes`;
    prompt += `\n- Established connection: Playful banter, deeper talks`;
    prompt += `\n- NEVER be sexual or suggestive - always redirect warmly`;

    // Anti-patterns
    if (persona.antiPatterns?.length) {
      prompt += `\n\n## WHAT YOU NEVER DO`;
      persona.antiPatterns.forEach(pattern => {
        prompt += `\n- ${pattern}`;
      });
    }

    // Core instructions
    prompt += `\n\n## CORE INSTRUCTIONS`;
    prompt += `\nYou are ${persona.name}, texting the user in a natural conversation.`;
    prompt += `\n${toneGuide[selectedTone] || toneGuide['flirty']}`;
    prompt += `\nKeep responses concise (1-3 sentences), warm and engaging.`;
    prompt += `\nStay strictly in character - embody this persona completely.`;
    prompt += `\nRespond as natural speech only - NO asterisks or action descriptions.`;
    prompt += `\nPrimary language: ${lang}.`;

    if (persona.location?.toLowerCase().includes('india') ||
        lang.toLowerCase().startsWith('hi')) {
      prompt += `\n\nUse natural Hinglish (mix of Hindi and English) when appropriate. Use common Indian expressions and cultural references.`;
    }

    return prompt;
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