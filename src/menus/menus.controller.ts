import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles/roles.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user/authenticated-user.interface.js';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto.js';
import { MenusService } from './menus.service.js';

@ApiTags('Menús')
@ApiBearerAuth()
@Controller('modulos/:moduloId/menus')
export class MenusController {
  constructor(private readonly menus: MenusService) {}

  @Get()
  @Roles('ADMIN', 'OPERADOR')
  findAll(@Param('moduloId', new ParseUUIDPipe({ version: '4' })) moduloId: string) {
    return this.menus.findAll(moduloId);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR')
  findOne(
    @Param('moduloId', new ParseUUIDPipe({ version: '4' })) moduloId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.menus.findOne(moduloId, id);
  }

  @Post()
  @Roles('ADMIN')
  create(
    @Param('moduloId', new ParseUUIDPipe({ version: '4' })) moduloId: string,
    @Body() dto: CreateMenuDto,
  ) {
    return this.menus.create(moduloId, dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('moduloId', new ParseUUIDPipe({ version: '4' })) moduloId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menus.update(moduloId, id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('moduloId', new ParseUUIDPipe({ version: '4' })) moduloId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.menus.remove(moduloId, id);
  }
}

@ApiTags('Menús')
@ApiBearerAuth()
@Controller('menus')
export class MyMenusController {
  constructor(private readonly menus: MenusService) {}

  @Get('mis-roles')
  findMyMenus(@CurrentUser() user: AuthenticatedUser) {
    return this.menus.forRoles(user.roles);
  }
}
