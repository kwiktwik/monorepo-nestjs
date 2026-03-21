import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, inArray, or, gt, isNotNull, desc, sql } from 'drizzle-orm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(DRIZZLE_TOKEN)
    private db: NodePgDatabase<typeof schema>,
  ) {}

  /**
   * Get equivalent app IDs for payment/subscription queries
   */
  private getEquivalentAppIds(appId: string): string[] {
    // Currently no equivalence needed for ShareStatus apps
    // But keeping this method for future flexibility
    return [appId];
  }

  /**
   * Get user profile with premium status
   */
  async getUserProfile(userId: string, appId: string) {
    // Fetch user data first (need to verify user exists and is not deleted)
    const userRecord = await this.db
      .select()
      .from(schema.user)
      .where(and(eq(schema.user.id, userId), eq(schema.user.isDeleted, false)))
      .limit(1);

    if (userRecord.length === 0) {
      throw new NotFoundException('User not found');
    }

    const userData = userRecord[0];

    // Compute equivalent app IDs once
    const equivalentAppIds = this.getEquivalentAppIds(appId);
    const now = new Date();

    // Run all remaining queries in parallel for better performance
    const [
      accounts,
      activeSubscriptions,
      userMeta,
      userImagesList,
      playStoreReview,
    ] = await Promise.all([
      // Fetch account type
      this.db
        .select()
        .from(schema.account)
        .where(eq(schema.account.userId, userId))
        .limit(1),

      // Compute premium status (paid orders or active subscription)
      this.db
        .select()
        .from(schema.subscriptions)
        .where(
          and(
            eq(schema.subscriptions.userId, userId),
            inArray(schema.subscriptions.appId, equivalentAppIds),
            or(
              eq(schema.subscriptions.status, 'active'),
              and(
                eq(schema.subscriptions.status, 'cancelled'),
                isNotNull(schema.subscriptions.endAt),
                gt(schema.subscriptions.endAt, now),
              ),
            ),
          ),
        )
        .limit(1),

      // Fetch user metadata
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

      // Fetch user images (profile photos)
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

      // Check if user has submitted a Play Store review
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
    const isPremium = activeSubscriptions.length > 0;
    const upiVpa = userMeta.length > 0 ? userMeta[0].upiVpa : null;
    const audioLanguage =
      userMeta.length > 0 ? userMeta[0].audioLanguage : null;

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
      upiVpa,
      audioLanguage,
      isPlayStoreReviewSubmitted: playStoreReview.length > 0,
      images,
    };
  }

  /**
   * List user images for GET /user/image/v1
   * Returns format compatible with Android ImageModel (id, imageUrl, removedBgImageUrl, createdAt)
   */
  async getUserImages(userId: string, appId: string) {
    const equivalentAppIds = this.getEquivalentAppIds(appId);

    const userImagesList = await this.db
      .select({
        id: schema.userImages.id,
        imageUrl: schema.userImages.imageUrl,
        removedBgImageUrl: schema.userImages.removedBgImageUrl,
        createdAt: schema.userImages.createdAt,
      })
      .from(schema.userImages)
      .where(
        and(
          eq(schema.userImages.userId, userId),
          inArray(schema.userImages.appId, equivalentAppIds),
        ),
      )
      .orderBy(desc(schema.userImages.createdAt));

    return userImagesList.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      removedBgImageUrl: img.removedBgImageUrl ?? '',
      createdAt: img.createdAt,
    }));
  }

  /**
   * Delete a single user image by ID.
   * Verifies the image belongs to the user and app before deleting.
   */
  async deleteUserImage(userId: string, appId: string, imageId: number) {
    const equivalentAppIds = this.getEquivalentAppIds(appId);

    const existing = await this.db
      .select()
      .from(schema.userImages)
      .where(
        and(
          eq(schema.userImages.id, imageId),
          eq(schema.userImages.userId, userId),
          inArray(schema.userImages.appId, equivalentAppIds),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Image not found');
    }

    await this.db
      .delete(schema.userImages)
      .where(eq(schema.userImages.id, imageId));
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    appId: string,
    updateData: UpdateUserDto,
  ) {
    // Validate phone number uniqueness if changing
    const existingUser = await this.db
      .select()
      .from(schema.user)
      .where(and(eq(schema.user.id, userId), eq(schema.user.isDeleted, false)))
      .limit(1);

    if (existingUser.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Update user table
    const userUpdateData: Partial<typeof schema.user.$inferInsert> = {
      name: updateData.name,
      updatedAt: new Date(),
    };

    if (updateData.email) {
      userUpdateData.email = updateData.email;
    }

    await this.db
      .update(schema.user)
      .set(userUpdateData)
      .where(eq(schema.user.id, userId));

    // Sync images to user_images when provided
    if (updateData.images && updateData.images.length > 0) {
      const equivalentAppIds = this.getEquivalentAppIds(appId);
      await this.db
        .delete(schema.userImages)
        .where(
          and(
            eq(schema.userImages.userId, userId),
            inArray(schema.userImages.appId, equivalentAppIds),
          ),
        );

      // Batch insert all valid images at once (N queries -> 1 query)
      const validImages = updateData.images
        .filter((imageUrl): imageUrl is string => Boolean(imageUrl?.trim()))
        .map((imageUrl) => ({
          userId,
          appId,
          imageUrl: imageUrl.trim(),
        }));

      if (validImages.length > 0) {
        await this.db.insert(schema.userImages).values(validImages);
      }
    }

    // Update or create user metadata if upiVpa or audioLanguage provided
    if (
      updateData.upiVpa !== undefined ||
      updateData.audioLanguage !== undefined
    ) {
      const equivalentAppIds = this.getEquivalentAppIds(appId);
      const existingMeta = await this.db
        .select()
        .from(schema.userMetadata)
        .where(
          and(
            eq(schema.userMetadata.userId, userId),
            inArray(schema.userMetadata.appId, equivalentAppIds),
          ),
        )
        .limit(1);

      const metadataUpdate: Partial<typeof schema.userMetadata.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (updateData.upiVpa !== undefined) {
        metadataUpdate.upiVpa = updateData.upiVpa || null;
      }

      if (updateData.audioLanguage !== undefined) {
        metadataUpdate.audioLanguage = updateData.audioLanguage || null;
      }

      if (existingMeta.length > 0) {
        await this.db
          .update(schema.userMetadata)
          .set(metadataUpdate)
          .where(
            and(
              eq(schema.userMetadata.userId, userId),
              inArray(schema.userMetadata.appId, equivalentAppIds),
            ),
          );
      } else {
        await this.db.insert(schema.userMetadata).values({
          userId,
          appId,
          upiVpa: updateData.upiVpa || null,
          audioLanguage: updateData.audioLanguage || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Fetch and return updated user data
    return this.getUserProfile(userId, appId);
  }

  /**
   * Soft delete user - marks user as deleted but preserves data
   */
  async deleteUser(userId: string) {
    // Check if user exists
    const userRecord = await this.db
      .select()
      .from(schema.user)
      .where(and(eq(schema.user.id, userId), eq(schema.user.isDeleted, false)))
      .limit(1);

    if (userRecord.length === 0) {
      throw new NotFoundException('User not found');
    }

    const deletedAt = new Date();

    // Soft delete: Mark user as deleted instead of removing data
    await this.db
      .update(schema.user)
      .set({
        isDeleted: true,
        deletedAt: deletedAt,
        email: `deleted_${userId}_${deletedAt.getTime()}@deleted.local`, // Anonymize email
        phoneNumber: null, // Remove phone number
        name: 'Deleted User', // Anonymize name
        image: null, // Remove profile image
        updatedAt: deletedAt,
      })
      .where(eq(schema.user.id, userId));

    // Delete active sessions to log user out
    await this.db
      .delete(schema.session)
      .where(eq(schema.session.userId, userId));

    return {
      success: true,
      message: 'User account marked as deleted successfully',
    };
  }

  /**
   * Permanently delete user and all associated data (GDPR compliance)
   * Use with caution - this is irreversible
   */
  async permanentlyDeleteUser(userId: string) {
    // Check if user exists (including soft-deleted)
    const userRecord = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Delete all related data
    await this.db
      .delete(schema.userMetadata)
      .where(eq(schema.userMetadata.userId, userId));

    await this.db.delete(schema.orders).where(eq(schema.orders.userId, userId));

    await this.db
      .delete(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, userId));

    await this.db
      .delete(schema.playStoreRatings)
      .where(eq(schema.playStoreRatings.userId, userId));

    await this.db
      .delete(schema.account)
      .where(eq(schema.account.userId, userId));

    await this.db
      .delete(schema.session)
      .where(eq(schema.session.userId, userId));

    // Finally, delete the user permanently
    await this.db.delete(schema.user).where(eq(schema.user.id, userId));

    return {
      success: true,
      message: 'User and all associated data permanently deleted',
    };
  }

  /**
   * Check if user has been migrated from kirana-fe
   */
  async checkMigrationStatus(userId: string) {
    const migrationRecord = await this.db
      .select({
        id: schema.migrationLogs.id,
        status: schema.migrationLogs.status,
        completedAt: schema.migrationLogs.completedAt,
        startedAt: schema.migrationLogs.startedAt,
        recordsCount: schema.migrationLogs.recordsCount,
      })
      .from(schema.migrationLogs)
      .where(eq(schema.migrationLogs.userId, userId))
      .orderBy(desc(schema.migrationLogs.createdAt))
      .limit(1);

    const isMigrated =
      migrationRecord.length > 0 && migrationRecord[0].status === 'completed';

    return {
      isMigrated,
      migrationDetails:
        migrationRecord.length > 0
          ? {
              migrationId: migrationRecord[0].id,
              status: migrationRecord[0].status,
              startedAt: migrationRecord[0].startedAt,
              completedAt: migrationRecord[0].completedAt,
              recordsMigrated: migrationRecord[0].recordsCount,
            }
          : null,
    };
  }
}
