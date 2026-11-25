import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module.js';
import { Modulo } from './entities/modulo.entity.js';
import { RoleModulo } from './entities/role-modulo.entity.js';
import { ModulosController } from './modulos.controller.js';
import { ModulosService } from './modulos.service.js';
import { RoleModulosController } from './role-modulos.controller.js';
import { RoleModulosService } from './role-modulos.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Modulo, RoleModulo]), RolesModule],
  controllers: [ModulosController, RoleModulosController],
  providers: [ModulosService, RoleModulosService],
})
export class ModulosModule {}

