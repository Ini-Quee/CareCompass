import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PregnancyProfileService } from './pregnancy-profile.service';
import { CreatePregnancyProfileDto } from './dto/create-pregnancy-profile.dto';
import { UpdatePregnancyProfileDto } from './dto/update-pregnancy-profile.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('pregnancy')
@Controller('pregnancy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PregnancyProfileController {
  constructor(private readonly pregnancyProfileService: PregnancyProfileService) {}

  @Post()
  @ApiOperation({ summary: 'Create pregnancy profile' })
  @ApiResponse({ status: 201, description: 'Pregnancy profile created' })
  async create(@Request() req, @Body() dto: CreatePregnancyProfileDto) {
    return this.pregnancyProfileService.create(req.user.sub, dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get current active pregnancy' })
  @ApiResponse({ status: 200, description: 'Current pregnancy profile' })
  async getCurrent(@Request() req) {
    return this.pregnancyProfileService.getCurrent(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pregnancy by ID' })
  @ApiResponse({ status: 200, description: 'Pregnancy profile' })
  async getById(@Request() req, @Param('id') id: string) {
    return this.pregnancyProfileService.getById(req.user.sub, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update pregnancy profile' })
  @ApiResponse({ status: 200, description: 'Pregnancy profile updated' })
  async update(@Request() req, @Param('id') id: string, @Body() dto: UpdatePregnancyProfileDto) {
    return this.pregnancyProfileService.update(req.user.sub, id, dto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive pregnancy (after birth)' })
  @ApiResponse({ status: 200, description: 'Pregnancy archived' })
  async archive(@Request() req, @Param('id') id: string) {
    return this.pregnancyProfileService.archive(req.user.sub, id);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get pregnancy summary' })
  @ApiResponse({ status: 200, description: 'Pregnancy summary with counts' })
  async getSummary(@Request() req, @Param('id') id: string) {
    return this.pregnancyProfileService.getSummary(req.user.sub, id);
  }
}
