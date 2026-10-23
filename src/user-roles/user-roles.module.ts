import { Module } from '@nestjs/common';
import { UserRolesService } from './user-roles.service.js';
import { UserRolesController } from './user-roles.controller.js';

@Module({
  controllers: [UserRolesController],
  providers: [UserRolesService],
})
export class UserRolesModule {}
