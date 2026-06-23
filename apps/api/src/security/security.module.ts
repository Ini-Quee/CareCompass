import { Module, Global } from '@nestjs/common';
import { SecurityMiddleware } from './security.middleware';
import { RateLimiterMiddleware } from './rate-limiter.middleware';
import { InputSanitizationMiddleware } from './input-sanitization.middleware';
import { AuditService } from './audit.service';
import { EncryptionService } from './encryption.service';

@Global()
@Module({
  providers: [
    SecurityMiddleware,
    RateLimiterMiddleware,
    InputSanitizationMiddleware,
    AuditService,
    EncryptionService,
  ],
  exports: [
    SecurityMiddleware,
    RateLimiterMiddleware,
    InputSanitizationMiddleware,
    AuditService,
    EncryptionService,
  ],
})
export class SecurityModule {}
