import { AuthType } from '../../../constants';
import { AuthStrategy } from './auth-strategy.interface';
import { ApiKeyAuthStrategy } from './api-key-auth.strategy';
import { BearerTokenAuthStrategy } from './bearer-token-auth.strategy';
import { CustomHeaderAuthStrategy } from './custom-header-auth.strategy';
import { NoAuthStrategy } from './no-auth.strategy';

export class AuthStrategyFactory {
  private static strategies = new Map<AuthType, AuthStrategy>([
    ['none', new NoAuthStrategy()],
    ['api_key', new ApiKeyAuthStrategy()],
    ['bearer_token', new BearerTokenAuthStrategy()],
    ['custom_header', new CustomHeaderAuthStrategy()],
  ]);

  static create(type: AuthType): AuthStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown auth type: ${type}`);
    }
    return strategy;
  }
}
