import { CreateCrawlEndpointDto } from './create-endpoint.dto';

export class UpdateCrawlEndpointDto implements Partial<CreateCrawlEndpointDto> {
  name?: string;
  description?: string;
  tags?: string[];
  baseUrl?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  timeoutMs?: number;
  active?: boolean;
  auth?: any;
  pagination?: any;
  request?: any;
  response?: any;
  schedule?: any;
  rateLimit?: any;
  retry?: any;
  deduplication?: any;
}
