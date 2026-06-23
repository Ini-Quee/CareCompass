import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimiterMiddleware implements NestMiddleware {
  private store = new Map<string, RateLimitEntry>();
  private readonly maxRequests = 100; // requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly loginMaxRequests = 5; // login attempts per window
  private readonly loginWindowMs = 15 * 60 * 1000; // 15 minutes

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const isLoginEndpoint = req.path.includes('/auth/login');
    const isRefreshEndpoint = req.path.includes('/auth/refresh');

    // Different limits for different endpoints
    let maxRequests = this.maxRequests;
    let windowMs = this.windowMs;

    if (isLoginEndpoint) {
      maxRequests = this.loginMaxRequests;
      windowMs = this.loginWindowMs;
    } else if (isRefreshEndpoint) {
      maxRequests = 20;
      windowMs = this.windowMs;
    }

    const key = `${ip}:${isLoginEndpoint ? 'login' : 'api'}`;
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // New window
      this.store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      return next();
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

      throw new HttpException(
        {
          statusCode: 429,
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment count
    entry.count++;
    
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - entry.count);
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());

    next();
  }

  // Cleanup old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}
