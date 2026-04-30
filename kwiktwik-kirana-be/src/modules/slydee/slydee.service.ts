import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface CompanionProfile {
  id: string;
  name: string;
  location: string;
  age: number;
  bio: string;
  description: string;
  imageUrls: string[];
  gifUrls: string[];
  interests: string[];
  isLocked: boolean;
  isSafeCompatible: boolean;
  freeChatCount: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompanionResponse {
  success: boolean;
  data: CompanionProfile[];
  count: number;
}

@Injectable()
export class SlydeeService implements OnModuleInit {
  private readonly logger = new Logger(SlydeeService.name);
  private companionData: CompanionProfile[] = [];

  onModuleInit(): void {
    this.loadCompanionData();
  }

  private loadCompanionData(): void {
    try {
      const dataPath = path.join(
        process.cwd(),
        'data',
        'companion_profile',
        'all_companions.json',
      );

      this.logger.log(`Loading companion data from: ${dataPath}`);

      if (!fs.existsSync(dataPath)) {
        this.logger.error(`Companion data file not found at: ${dataPath}`);
        return;
      }

      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      this.companionData = JSON.parse(fileContent) as CompanionProfile[];

      this.logger.log(
        `Successfully loaded ${this.companionData.length} companion profiles`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to load companion data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.companionData = [];
    }
  }

  /**
   * Get all companion profiles
   */
  getAllCompanions(): CompanionResponse {
    return {
      success: true,
      data: this.companionData,
      count: this.companionData.length,
    };
  }

  /**
   * Get companion by ID
   */
  getCompanionById(id: string): CompanionProfile | null {
    return this.companionData.find((companion) => companion.id === id) || null;
  }

  /**
   * Reload companion data from file
   */
  reloadData(): CompanionResponse {
    this.loadCompanionData();
    return this.getAllCompanions();
  }
}
