import { PartialType } from '@nestjs/swagger';
import { CreatePregnancyProfileDto } from './create-pregnancy-profile.dto';

export class UpdatePregnancyProfileDto extends PartialType(CreatePregnancyProfileDto) {}
