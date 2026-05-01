import { GoogleAuth } from 'google-auth-library';

export interface VertexAiConfig {
  projectId: string;
  region: string;
  serviceAccountPath: string;
}

export const VERTEX_AI_CONFIG: VertexAiConfig = {
  projectId: 'storyowl-kwiktwik',
  region: 'us-east1',
  serviceAccountPath: './secrets/vertex-ai-storyowl-key.json',
};

let cachedAuth: GoogleAuth | null = null;

export function getVertexAuth(
  config: VertexAiConfig = VERTEX_AI_CONFIG,
): GoogleAuth {
  if (!cachedAuth) {
    cachedAuth = new GoogleAuth({
      keyFile: config.serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }
  return cachedAuth;
}

export async function getVertexAccessToken(
  config: VertexAiConfig = VERTEX_AI_CONFIG,
): Promise<string> {
  const auth = getVertexAuth(config);
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) {
    throw new Error('Failed to obtain Vertex AI access token');
  }
  return tokenResponse.token;
}