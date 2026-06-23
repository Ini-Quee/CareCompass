import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PregnancyMedicationService } from './pregnancy-medication.service';
import { CreatePregnancyMedicationDto } from './dto/create-pregnancy-medication.dto';
import { LogMedicationDto } from './dto/log-medication.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('pregnancy-medications')
@Controller('pregnancy/:pregnancyId/medications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PregnancyMedicationController {
  constructor(private readonly medicationService: PregnancyMedicationService) {}

  @Post()
  @ApiOperation({ summary: 'Add medication' })
  @ApiResponse({ status: 201, description: 'Medication added' })
  async create(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Body() dto: CreatePregnancyMedicationDto,
  ) {
    return this.medicationService.create(req.user.sub, pregnancyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List active medications' })
  @ApiResponse({ status: 200, description: 'Medications list' })
  async findAll(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.medicationService.findAll(req.user.sub, pregnancyId);
  }

  @Get('adherence')
  @ApiOperation({ summary: 'Get adherence report' })
  @ApiResponse({ status: 200, description: 'Adherence data' })
  async getAdherence(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.medicationService.getAdherence(req.user.sub, pregnancyId);
  }

  @Get(':medicationId')
  @ApiOperation({ summary: 'Get medication detail' })
  @ApiResponse({ status: 200, description: 'Medication detail' })
  async findOne(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('medicationId') medicationId: string,
  ) {
    return this.medicationService.findOne(req.user.sub, pregnancyId, medicationId);
  }

  @Put(':medicationId')
  @ApiOperation({ summary: 'Update medication' })
  @ApiResponse({ status: 200, description: 'Medication updated' })
  async update(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('medicationId') medicationId: string,
    @Body() dto: Partial<CreatePregnancyMedicationDto>,
  ) {
    return this.medicationService.update(req.user.sub, pregnancyId, medicationId, dto);
  }

  @Delete(':medicationId')
  @ApiOperation({ summary: 'Deactivate medication' })
  @ApiResponse({ status: 200, description: 'Medication deactivated' })
  async deactivate(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('medicationId') medicationId: string,
  ) {
    return this.medicationService.deactivate(req.user.sub, pregnancyId, medicationId);
  }

  @Post(':medicationId/log')
  @ApiOperation({ summary: 'Log dose taken/skipped' })
  @ApiResponse({ status: 201, description: 'Dose logged' })
  async logDose(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('medicationId') medicationId: string,
    @Body() dto: LogMedicationDto,
  ) {
    return this.medicationService.logDose(req.user.sub, pregnancyId, medicationId, dto);
  }

  @Get(':medicationId/logs')
  @ApiOperation({ summary: 'Get dose history' })
  @ApiResponse({ status: 200, description: 'Dose history' })
  async getDoseHistory(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('medicationId') medicationId: string,
  ) {
    return this.medicationService.getDoseHistory(req.user.sub, pregnancyId, medicationId);
  }

  @Post(':medicationId/side-effects')
  @ApiOperation({ summary: 'Log side effect' })
  @ApiResponse({ status: 201, description: 'Side effect logged' })
  async logSideEffect(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('medicationId') medicationId: string,
    @Body() body: { symptomName: string; severity: number; notes?: string },
  ) {
    return this.medicationService.logSideEffect(
      req.user.sub,
      pregnancyId,
      medicationId,
      body.symptomName,
      body.severity,
      body.notes,
    );
  }
}
