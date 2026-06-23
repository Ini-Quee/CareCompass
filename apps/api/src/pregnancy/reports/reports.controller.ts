import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('pregnancy-reports')
@Controller('pregnancy/:pregnancyId/reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate provider report' })
  @ApiResponse({ status: 201, description: 'Report generated' })
  async generateReport(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Body() body: {
      dateRangeStart?: string;
      dateRangeEnd?: string;
      sections?: string[];
    },
  ) {
    return this.reportsService.generateProviderReport(req.user.sub, pregnancyId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List generated reports' })
  @ApiResponse({ status: 200, description: 'Reports list' })
  async getReports(@Request() req, @Param('pregnancyId') pregnancyId: string) {
    return this.reportsService.getReports(req.user.sub, pregnancyId);
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Get report detail' })
  @ApiResponse({ status: 200, description: 'Report detail' })
  async getReport(
    @Request() req,
    @Param('pregnancyId') pregnancyId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.reportsService.getReport(req.user.sub, pregnancyId, reportId);
  }
}
