import { IsString, IsOptional, IsInt, IsArray, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePregnancySymptomDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entryTime?: string;

  @ApiProperty({ required: false, enum: ['morning', 'evening', 'other'] })
  @IsOptional()
  @IsString()
  timeOfDay?: string;

  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  nauseaSeverity?: number;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  vomitingCount?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  dizzinessSeverity?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  headacheSeverity?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  swellingLocations?: string[];

  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  swellingSeverity?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  fatigueSeverity?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  sleepQuality?: number;

  @ApiProperty({ required: false, enum: ['great', 'good', 'okay', 'low', 'rough'] })
  @IsOptional()
  @IsString()
  mood?: string;

  @ApiProperty({ required: false, enum: ['poor', 'fair', 'good', 'strong'] })
  @IsOptional()
  @IsString()
  appetite?: string;

  @ApiProperty({ required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  waterGlasses?: number;

  @ApiProperty({ required: false, minimum: 0, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  painLevel?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  painLocations?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notesForDoctor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  freeText?: string;

  @ApiProperty({ required: false, enum: ['manual', 'voice', 'quick_log', 'retroactive'] })
  @IsOptional()
  @IsString()
  entryMethod?: string;
}
