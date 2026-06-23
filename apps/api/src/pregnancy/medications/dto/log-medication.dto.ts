import { IsString, IsOptional, IsArray, IsDateString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogMedicationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  actualTime?: string;

  @ApiProperty({ enum: ['taken', 'skipped', 'snoozed', 'missed'] })
  @IsString()
  @IsIn(['taken', 'skipped', 'snoozed', 'missed'])
  status: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sideEffectsNoted?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
