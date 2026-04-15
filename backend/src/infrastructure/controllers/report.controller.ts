import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@domain/enums/role.enum';
import { GenerateReportUseCase } from '@application/use-cases/generate-report.use-case';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportController {
  constructor(private readonly generateReport: GenerateReportUseCase) {}

  /** Solo ADMIN puede generar reportes de ingresos */
  @Get()
  @Roles(Role.ADMIN)
  async getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.generateReport.execute(start, end);
  }
}
