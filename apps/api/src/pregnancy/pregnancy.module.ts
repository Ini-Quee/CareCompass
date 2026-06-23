import { Module } from '@nestjs/common';
import { PregnancyProfileService } from './profile/pregnancy-profile.service';
import { PregnancyProfileController } from './profile/pregnancy-profile.controller';
import { PregnancySymptomService } from './symptoms/pregnancy-symptom.service';
import { PregnancySymptomController } from './symptoms/pregnancy-symptom.controller';
import { PregnancyMedicationService } from './medications/pregnancy-medication.service';
import { PregnancyMedicationController } from './medications/pregnancy-medication.controller';
import { VitalsService } from './vitals/vitals.service';
import { VitalsController } from './vitals/vitals.controller';
import { ReportsService } from './reports/reports.service';
import { ReportsController } from './reports/reports.controller';
import { CorrelationEngineService } from './correlation/correlation-engine.service';

@Module({
  controllers: [
    PregnancyProfileController,
    PregnancySymptomController,
    PregnancyMedicationController,
    VitalsController,
    ReportsController,
  ],
  providers: [
    PregnancyProfileService,
    PregnancySymptomService,
    PregnancyMedicationService,
    VitalsService,
    ReportsService,
    CorrelationEngineService,
  ],
  exports: [
    PregnancyProfileService,
    PregnancySymptomService,
    PregnancyMedicationService,
    VitalsService,
    ReportsService,
    CorrelationEngineService,
  ],
})
export class PregnancyModule {}
