import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modulo } from '../modulos/entities/modulo.entity.js';
import { RoleModulo } from '../modulos/entities/role-modulo.entity.js';
import { Menu } from './entities/menu.entity.js';
import { MenusController, MyMenusController } from './menus.controller.js';
import { MenusService } from './menus.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Modulo, RoleModulo])],
  controllers: [MenusController, MyMenusController],
  providers: [MenusService],
})
export class MenusModule {}
