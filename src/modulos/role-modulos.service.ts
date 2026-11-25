import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { RolesService } from '../roles/roles.service.js';
import { RoleModulo } from './entities/role-modulo.entity.js';
import { ModulosService } from './modulos.service.js';

@Injectable()
export class RoleModulosService {
  constructor(
    @InjectRepository(RoleModulo) private readonly assignments: Repository<RoleModulo>,
    private readonly roles: RolesService,
    private readonly modulos: ModulosService,
  ) {}

  async assign(roleId: string, moduloId: string) {
    const [, modulo] = await Promise.all([
      this.roles.findOne(roleId),
      this.modulos.findOne(moduloId),
    ]);
    const assignment = { roleId, moduloId, fechaAsignacion: new Date() };

    try {
      await this.assignments.insert(assignment);
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === '23505') {
        throw new ConflictException('El rol ya tiene asignado este módulo');
      }
      throw error;
    }

    return { ...assignment, modulo };
  }

  async findByRole(roleId: string) {
    await this.roles.findOne(roleId);
    return this.assignments.createQueryBuilder('asignacion')
      .innerJoinAndSelect('asignacion.modulo', 'modulo')
      .where('asignacion.roleId = :roleId', { roleId })
      .orderBy('modulo.codigo', 'ASC')
      .getMany();
  }

  async remove(roleId: string, moduloId: string): Promise<void> {
    await this.roles.findOne(roleId);
    const result = await this.assignments.delete({ roleId, moduloId });
    if (!result.affected) throw new NotFoundException('El rol no tiene asignado este módulo');
  }
}

