import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PregnancySymptomService } from './pregnancy-symptom.service';
import { CreatePregnancySymptomDto } from './dto/create-pregnancy-symptom.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('pregnancy-symptoms')
@Controller('pregnancy/:pregnancyId/symptoms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PregnancySymptomController {
  constructor(private readonly symptomService: PregnancySymptomService) {}

  @Post()
  @ApiOperation({ summary: 'Log symptom entry' })
  @ApiResponse({ status: 201, description: 'Symptom entry created' })
  async create(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Body() dto: CreatePregnancySymptomDto,
  ) {
    return this.symptomService.create(req.user.sub, pregnancyId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get symptom history' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Symptom history' })
  async findAll(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.symptomService.findAll(req.user.sub, pregnancyId, startDate, endDate);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's symptom entries" })
  @ApiResponse({ status: 200, description: "Today's entries" })
  async getToday(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.symptomService.getToday(req.user.sub, pregnancyId);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get symptom trends' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze' })
  @ApiResponse({ status: 200, description: 'Symptom trends' })
  async getTrends(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Query('days') days?: number,
  ) {
    return this.symptomService.getTrends(req.user.sub, pregnancyId, days);
  }

  @Get(':entryId')
  @ApiOperation({ summary: 'Get specific symptom entry' })
  @ApiResponse({ status: 200, description: 'Symptom entry' })
  async findOne(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('entryId') entryId: string,
  ) {
    return this.symptomService.findOne(req.user.sub, pregnancyId, entryId);
  }

  @Put(':entryId')
  @ApiOperation({ summary: 'Update symptom entry' })
  @ApiResponse({ status: 200, description: 'Entry updated' })
  async update(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('entryId') entryId: string,
    @Body() dto: Partial<CreatePregnancySymptomDto>,
  ) {
    return this.symptomService.update(req.user.sub, pregnancyId, entryId, dto);
  }

  @Delete(':entryId')
  @ApiOperation({ summary: 'Delete symptom entry' })
  @ApiResponse({ status: 200, description: 'Entry deleted' })
  async remove(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('entryId') entryId: string,
  ) {
    return this.symptomService.remove(req.user.sub, pregnancyId, entryId);
  }
}
