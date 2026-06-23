import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VitalsService } from './vitals.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('pregnancy-vitals')
@Controller('pregnancy/:pregnancyId/vitals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  // ===== BLOOD PRESSURE =====

  @Post('bp')
  @ApiOperation({ summary: 'Log blood pressure reading' })
  @ApiResponse({ status: 201, description: 'BP logged' })
  async logBP(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Body() body: { systolic: number; diastolic: number; heartRate?: number; notes?: string },
  ) {
    return this.vitalsService.logBP(req.user.sub, pregnancyId, body);
  }

  @Get('bp')
  @ApiOperation({ summary: 'Get BP history' })
  @ApiQuery({ name: 'days', required: false })
  @ApiResponse({ status: 200, description: 'BP history' })
  async getBPHistory(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Query('days') days?: number,
  ) {
    return this.vitalsService.getBPHistory(req.user.sub, pregnancyId, days);
  }

  @Get('bp/trends')
  @ApiOperation({ summary: 'Get BP trends' })
  @ApiResponse({ status: 200, description: 'BP trends' })
  async getBPTrends(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.vitalsService.getBPTrends(req.user.sub, pregnancyId);
  }

  @Get('bp/alerts')
  @ApiOperation({ summary: 'Get BP alerts' })
  @ApiResponse({ status: 200, description: 'BP alerts' })
  async getBPAlerts(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.vitalsService.getBPAlerts(req.user.sub, pregnancyId);
  }

  // ===== BLOOD SUGAR =====

  @Post('blood-sugar')
  @ApiOperation({ summary: 'Log blood sugar reading' })
  @ApiResponse({ status: 201, description: 'Blood sugar logged' })
  async logBloodSugar(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Body() body: {
      readingType: string;
      bloodSugarValue: number;
      mealDescription?: string;
      carbCount?: number;
      insulinDose?: number;
      insulinType?: string;
      notes?: string;
    },
  ) {
    return this.vitalsService.logBloodSugar(req.user.sub, pregnancyId, body);
  }

  @Get('blood-sugar')
  @ApiOperation({ summary: 'Get blood sugar history' })
  @ApiQuery({ name: 'days', required: false })
  @ApiResponse({ status: 200, description: 'Blood sugar history' })
  async getBloodSugarHistory(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Query('days') days?: number,
  ) {
    return this.vitalsService.getBloodSugarHistory(req.user.sub, pregnancyId, days);
  }

  @Get('blood-sugar/trends')
  @ApiOperation({ summary: 'Get blood sugar trends' })
  @ApiResponse({ status: 200, description: 'Blood sugar trends' })
  async getBloodSugarTrends(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.vitalsService.getBloodSugarTrends(req.user.sub, pregnancyId);
  }

  @Get('blood-sugar/weekly-log')
  @ApiOperation({ summary: 'Get weekly log for doctor' })
  @ApiResponse({ status: 200, description: 'Weekly blood sugar log' })
  async getWeeklyLog(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.vitalsService.getWeeklyLog(req.user.sub, pregnancyId);
  }

  // ===== WEIGHT =====

  @Post('weight')
  @ApiOperation({ summary: 'Log weight' })
  @ApiResponse({ status: 201, description: 'Weight logged' })
  async logWeight(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Body() body: { weightLbs?: number; weightKg?: number; notes?: string },
  ) {
    return this.vitalsService.logWeight(req.user.sub, pregnancyId, body);
  }

  @Get('weight')
  @ApiOperation({ summary: 'Get weight history' })
  @ApiResponse({ status: 200, description: 'Weight history' })
  async getWeightHistory(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.vitalsService.getWeightHistory(req.user.sub, pregnancyId);
  }

  // ===== FETAL MOVEMENT =====

  @Post('kicks')
  @ApiOperation({ summary: 'Log kick session' })
  @ApiResponse({ status: 201, description: 'Kick session logged' })
  async logKickSession(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Body() body: { sessionDurationMinutes: number; kickCount: number; notes?: string },
  ) {
    return this.vitalsService.logKickSession(req.user.sub, pregnancyId, body);
  }

  @Get('kicks')
  @ApiOperation({ summary: 'Get kick history' })
  @ApiResponse({ status: 200, description: 'Kick history' })
  async getKickHistory(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.vitalsService.getKickHistory(req.user.sub, pregnancyId);
  }

  @Get('kicks/today')
  @ApiOperation({ summary: "Get today's kick sessions" })
  @ApiResponse({ status: 200, description: "Today's kick sessions" })
  async getKicksToday(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.vitalsService.getKicksToday(req.user.sub, pregnancyId);
  }
}
