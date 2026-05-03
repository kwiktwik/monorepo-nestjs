import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, inArray, isNotNull, desc } from 'drizzle-orm';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { EntitlementService } from '../payment-gateway/services/entitlement.service';

@Injectable()
export class UserV3Service {
  private readonly logger = new Logger(UserV3Service.name);

  constructor(
    @Inject(DRIZZLE_TOKEN)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly entitlementService: EntitlementService,
  ) {}

  async getUserProfile(userId: string, appId: string) {
    const userRecord = await this.db
      .select()
      .from(schema.user)
      .where(and(eq(schema.user.id, userId), eq(schema.user.isDeleted, false)))
      .limit(1);

    if (userRecord.length === 0) {
      throw new NotFoundException('User not found');
    }

    const userData = userRecord[0];
    const equivalentAppIds = [appId];

    const [accounts, entitlement, userMeta, userImagesList, playStoreReview] =
      await Promise.all([
        this.db
          .select()
          .from(schema.account)
          .where(eq(schema.account.userId, userId))
          .limit(1),

        this.entitlementService.getActiveEntitlement(userId, appId),

        this.db
          .select()
          .from(schema.userMetadata)
          .where(
            and(
              eq(schema.userMetadata.userId, userId),
              inArray(schema.userMetadata.appId, equivalentAppIds),
            ),
          )
          .limit(1),

        this.db
          .select({
            id: schema.userImages.id,
            imageUrl: schema.userImages.imageUrl,
            removedBgImageUrl: schema.userImages.removedBgImageUrl,
          })
          .from(schema.userImages)
          .where(
            and(
              eq(schema.userImages.userId, userId),
              inArray(schema.userImages.appId, equivalentAppIds),
            ),
          )
          .orderBy(desc(schema.userImages.createdAt)),

        this.db
          .select({ id: schema.playStoreRatings.id })
          .from(schema.playStoreRatings)
          .where(
            and(
              eq(schema.playStoreRatings.userId, userId),
              inArray(schema.playStoreRatings.appId, equivalentAppIds),
              isNotNull(schema.playStoreRatings.submittedToPlayStoreAt),
            ),
          )
          .limit(1),
      ]);

    const accountType = accounts.length > 0 ? accounts[0].providerId : null;
    const isPremium = !!entitlement;
    const premiumExpiresAt = entitlement?.validUntil ?? null;
    const premiumSource = entitlement?.sourceType ?? null;
    const upiVpa = userMeta.length > 0 ? userMeta[0].upiVpa : null;
    const audioLanguage = userMeta.length > 0 ? userMeta[0].audioLanguage : null;
    const clientData = userMeta.length > 0 ? userMeta[0].clientData : null;

    const images = userImagesList.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      removedBgImageUrl: img.removedBgImageUrl ?? '',
    }));

    return {
      id: userData.id,
      name: userData.name,
      phoneNumber: userData.phoneNumber,
      email: userData.email,
      accountType,
      emailVerified: userData.emailVerified,
      phoneNumberVerified: userData.phoneNumberVerified,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      appId,
      isPremium,
      premiumExpiresAt,
      premiumSource,
      currentEnd: premiumExpiresAt,
      upiVpa,
      audioLanguage,
      clientData,
      isPlayStoreReviewSubmitted: playStoreReview.length > 0,
      images,
    };
  }
}