import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles/roles.decorator.js';
import { AssignModuloDto } from './dto/assign-modulo.dto.js';
import { RoleModulosService } from './role-modulos.service.js';

@ApiTags('Módulos por rol')
@ApiBearerAuth()
@Controller('roles/:roleId/modulos')
export class RoleModulosController {
  constructor(private readonly assignments: RoleModulosService) {}

  @Post()
  @Roles('ADMIN')
  assign(
    @Param('roleId', new ParseUUIDPipe({ version: '4' })) roleId: string,
    @Body() dto: AssignModuloDto,
  ) {
    return this.assignments.assign(roleId, dto.moduloId);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR')
  findByRole(@Param('roleId', new ParseUUIDPipe({ version: '4' })) roleId: string) {
    return this.assignments.findByRole(roleId);
  }

  @Delete(':moduloId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('roleId', new ParseUUIDPipe({ version: '4' })) roleId: string,
    @Param('moduloId', new ParseUUIDPipe({ version: '4' })) moduloId: string,
  ) {
    return this.assignments.remove(roleId, moduloId);
  }
}

