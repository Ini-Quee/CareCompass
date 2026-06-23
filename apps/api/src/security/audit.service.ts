import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  status?: 'success' | 'failure';
  errorMessage?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          metadata: {
            ...entry.metadata,
            status: entry.status || 'success',
            errorMessage: entry.errorMessage,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      // Don't let audit logging failures break the application
      console.error('Audit logging failed:', error);
    }
  }

  async logAuth(entry: {
    userId?: string;
    action: 'login' | 'logout' | 'register' | 'password_reset' | 'mfa_enable' | 'mfa_verify';
    email?: string;
    ipAddress?: string;
    userAgent?: string;
    status: 'success' | 'failure';
    errorMessage?: string;
  }): Promise<void> {
    await this.log({
      userId: entry.userId,
      action: entry.action,
      resourceType: 'auth',
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: {
        email: entry.email,
      },
      status: entry.status,
      errorMessage: entry.errorMessage,
    });
  }

  async logDataAccess(entry: {
    userId: string;
    action: 'create' | 'read' | 'update' | 'delete';
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      userId: entry.userId,
      action: entry.action,
      resourceType: entry.resourceType,
      resourceId: entry.resourceId,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: entry.metadata,
      status: 'success',
    });
  }

  async logSecurityEvent(entry: {
    userId?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
  }): Promise<void> {
    await this.log({
      userId: entry.userId,
      action: `security.${entry.action}`,
      resourceType: 'security',
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      metadata: {
        ...entry.metadata,
        severity: entry.severity,
      },
    });
  }

  async getAuditTrail(params: {
    userId?: string;
    resourceType?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (params.userId) where.userId = params.userId;
    if (params.resourceType) where.resourceType = params.resourceType;
    if (params.action) where.action = params.action;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: params.limit || 100,
        skip: params.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit: params.limit || 100,
      offset: params.offset || 0,
    };
  }

  async detectAnomalies(userId: string): Promise<string[]> {
    const anomalies: string[] = [];
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Check for multiple failed login attempts
    const failedLogins = await this.prisma.auditLog.count({
      where: {
        userId,
        action: 'login',
        metadata: {
          path: ['status'],
          equals: 'failure',
        },
        createdAt: { gte: last24Hours },
      },
    });

    if (failedLogins >= 5) {
      anomalies.push(`Multiple failed login attempts: ${failedLogins} in last 24 hours`);
    }

    // Check for unusual data access patterns
    const dataAccess = await this.prisma.auditLog.count({
      where: {
        userId,
        action: { in: ['create', 'update', 'delete'] },
        createdAt: { gte: last24Hours },
      },
    });

    if (dataAccess >= 100) {
      anomalies.push(`High data modification rate: ${dataAccess} operations in last 24 hours`);
    }

    // Check for access from multiple IPs
    const uniqueIps = await this.prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: last24Hours },
      },
      select: { ipAddress: true },
      distinct: ['ipAddress'],
    });

    if (uniqueIps.length >= 5) {
      anomalies.push(`Access from ${uniqueIps.length} different IP addresses in last 24 hours`);
    }

    return anomalies;
  }
}
