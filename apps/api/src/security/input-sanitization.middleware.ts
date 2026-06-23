import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  private readonly dangerousPatterns = [
    // SQL Injection
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b.*\b(FROM|INTO|SET|WHERE|TABLE|DATABASE)\b)/i,
    /(OR|AND)\s+\d+\s*=\s*\d+/i,
    /'\s*(OR|AND)\s+'/i,
    /--/,
    /\/\*.*?\*\//,
    
    // XSS
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    
    // Path Traversal
    /\.\.\//,
    /\.\.\\/,
    
    // Command Injection
    /[;&|`$]/,
    /\$\(.*\)/,
  ];

  private readonly maxLengths = {
    email: 255,
    password: 128,
    name: 100,
    text: 5000,
    description: 10000,
  };

  use(req: Request, res: Response, next: NextFunction) {
    try {
      // Sanitize body
      if (req.body && typeof req.body === 'object') {
        this.sanitizeObject(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        this.sanitizeObject(req.query);
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        this.sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid input detected',
          error: 'Bad Request',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private sanitizeObject(obj: any): void {
    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (typeof value === 'string') {
        // Check for dangerous patterns
        for (const pattern of this.dangerousPatterns) {
          if (pattern.test(value)) {
            throw new Error(`Dangerous pattern detected in field: ${key}`);
          }
        }

        // Trim and limit length
        obj[key] = value.trim().substring(0, this.getMaxLength(key));
      } else if (typeof value === 'object' && value !== null) {
        this.sanitizeObject(value);
      }
    }
  }

  private getMaxLength(fieldName: string): number {
    const lowerField = fieldName.toLowerCase();
    
    if (lowerField.includes('email')) return this.maxLengths.email;
    if (lowerField.includes('password')) return this.maxLengths.password;
    if (lowerField.includes('name')) return this.maxLengths.name;
    if (lowerField.includes('description') || lowerField.includes('text')) return this.maxLengths.description;
    
    return this.maxLengths.text;
  }
}
