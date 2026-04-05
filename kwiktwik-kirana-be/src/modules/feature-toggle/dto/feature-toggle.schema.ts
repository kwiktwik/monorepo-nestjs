import { z } from 'zod';

export const EvaluateFeatureSchema = z.object({
  featureKey: z.string().min(1, 'Feature key is required'),
  context: z.record(z.string(), z.unknown()).optional(),
});

export type EvaluateFeatureInput = z.infer<typeof EvaluateFeatureSchema>;

export interface ExtractedIdentity {
  value: string;
  type: 'firebaseInstallationId' | 'deviceId' | 'userId';
}

export interface FeatureEvaluation {
  success: boolean;
  appId: string;
  featureKey: string;
  identity: ExtractedIdentity;
  enabled: boolean;
  variant?: string;
  config?: Record<string, unknown>;
  experimentId?: number;
  reason?: string;
}

export interface FeatureToggleError {
  success: boolean;
  error: string;
  code: string;
}

export interface FeatureToggleRequest {
  appId: string;
  identity: {
    firebaseInstallationId?: string;
    deviceId?: string;
    userId?: string;
  };
}
