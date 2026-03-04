import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DRIZZLE_TOKEN } from '../../database/drizzle.module';
import * as schema from '../../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, inArray, or, gt, isNotNull, desc } from 'drizzle-orm';
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
    // Fetch user data first (need to verify user exists)
    const userRecord = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
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

    const images = userImagesList.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
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
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (existingUser.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Check if phone number is being changed and if it's already taken
    if (
      updateData.phoneNumber &&
      updateData.phoneNumber !== existingUser[0].phoneNumber
    ) {
      const phoneCheck = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.phoneNumber, updateData.phoneNumber))
        .limit(1);

      if (phoneCheck.length > 0 && phoneCheck[0].id !== userId) {
        throw new BadRequestException('Phone number is already in use');
      }
    }

    // Update user table
    const userUpdateData: Partial<typeof schema.user.$inferInsert> = {
      name: updateData.name,
      phoneNumber: updateData.phoneNumber,
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

    // Update or create user metadata if upiVpa provided
    if (updateData.upiVpa !== undefined) {
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

      if (existingMeta.length > 0) {
        await this.db
          .update(schema.userMetadata)
          .set({
            upiVpa: updateData.upiVpa || null,
            updatedAt: new Date(),
          })
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
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Fetch and return updated user data
    return this.getUserProfile(userId, appId);
  }

  /**
   * Delete user and all associated data
   */
  async deleteUser(userId: string) {
    // Check if user exists
    const userRecord = await this.db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (userRecord.length === 0) {
      throw new NotFoundException('User not found');
    }

    // Delete all related data (cascade will handle most, but being explicit)
    // Note: Some tables use cascade delete in the schema, but we'll be explicit

    // Delete user metadata
    await this.db
      .delete(schema.userMetadata)
      .where(eq(schema.userMetadata.userId, userId));

    // Delete orders
    await this.db.delete(schema.orders).where(eq(schema.orders.userId, userId));

    // Delete subscriptions
    await this.db
      .delete(schema.subscriptions)
      .where(eq(schema.subscriptions.userId, userId));

    // Delete play store ratings
    await this.db
      .delete(schema.playStoreRatings)
      .where(eq(schema.playStoreRatings.userId, userId));

    // Delete accounts
    await this.db
      .delete(schema.account)
      .where(eq(schema.account.userId, userId));

    // Delete sessions
    await this.db
      .delete(schema.session)
      .where(eq(schema.session.userId, userId));

    // Finally, delete the user
    await this.db.delete(schema.user).where(eq(schema.user.id, userId));

    return {
      success: true,
      message: 'User and all associated data deleted successfully',
    };
  }
}
