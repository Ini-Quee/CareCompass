import { IsString, IsOptional, IsArray, IsDateString, IsInt, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePregnancyMedicationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dosageUnit?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  frequency?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  times?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  foodRequirement?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  commonSideEffects?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  supplyQuantity?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  supplyRemaining?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  refillDate?: string;
}
