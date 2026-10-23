import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { RolesModule } from './roles/roles.module.js';
import { UserRolesModule } from './user-roles/user-roles.module.js';

@Module({
  imports: [UsersModule, RolesModule, UserRolesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
