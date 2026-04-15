import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@domain/enums/role.enum';
import { PlanRepositoryPort, PLAN_REPOSITORY } from '@domain/ports/plan-repository.port';
import { CreatePlanDto } from '../dtos/plan.dto';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanController {
  constructor(@Inject(PLAN_REPOSITORY) private readonly planRepo: PlanRepositoryPort) {}

  /** Cualquier usuario autenticado puede ver los planes */
  @Get()
  async findAll() {
    return this.planRepo.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.planRepo.findById(id);
  }

  /** Solo ADMIN puede crear planes */
  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() dto: CreatePlanDto) {
    return this.planRepo.create({
      name: dto.name,
      type: dto.type,
      price: dto.price,
      description: dto.description,
      features: dto.features,
      durationDays: dto.durationDays,
    });
  }

  /** Solo ADMIN puede actualizar planes */
  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: Partial<CreatePlanDto>) {
    return this.planRepo.update(id, dto);
  }

  /** Solo ADMIN puede eliminar planes */
  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    await this.planRepo.delete(id);
    return { message: 'Plan deleted successfully' };
  }
}
