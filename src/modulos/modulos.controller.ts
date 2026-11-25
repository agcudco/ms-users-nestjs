import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles/roles.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto.js';
import { CreateModuloDto } from './dto/create-modulo.dto.js';
import { UpdateModuloDto } from './dto/update-modulo.dto.js';
import { ModulosService } from './modulos.service.js';

@ApiTags('Módulos')
@ApiBearerAuth()
@Controller('modulos')
export class ModulosController {
  constructor(private readonly modulos: ModulosService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateModuloDto) {
    return this.modulos.create(dto);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR')
  findAll(@Query() pagination: PaginationQueryDto) {
    return this.modulos.findAll(pagination);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.modulos.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateModuloDto,
  ) {
    return this.modulos.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.modulos.remove(id);
  }
}

