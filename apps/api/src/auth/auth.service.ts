import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'register',
        resourceType: 'user',
        resourceId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'login',
        resourceType: 'user',
        resourceId: user.id,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Check if token exists and hasn't been used
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          userId: payload.sub,
          tokenHash: await bcrypt.hash(refreshToken, 10),
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Mark token as used
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(payload.sub, payload.email);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    // Invalidate all refresh tokens for user
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'logout',
        resourceType: 'user',
        resourceId: userId,
      },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string) {
    const jti = uuidv4();

    // Generate access token
    const accessToken = this.jwtService.sign({
      sub: userId,
      email,
      jti,
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(
      {
        sub: userId,
        email,
        jti,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRY', '7d'),
      },
    );

    // Store refresh token hash
    const salt = await bcrypt.genSalt(10);
    const tokenHash = await bcrypt.hash(refreshToken, salt);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
