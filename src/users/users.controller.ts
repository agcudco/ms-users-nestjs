import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { PreviewUsernameDto } from './dto/preview-username.dto.js';
import { CurrentUser } from '../auth/decorators/current-user/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user/authenticated-user.interface.js';
import { UsersService } from './users.service.js';
import { CedulaPipe } from '../common/pipes/cedula/cedula.pipe.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto.js';
import { Roles } from '../auth/decorators/roles/roles.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  create(
    @Body()
    dto: CreateUserDto,
  ) {
    return this.usersService.create(dto);
  }

  @Post('username-preview')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  previewUsername(@Body() { nombres, apellidos }: PreviewUsernameDto) {
    return this.usersService.previewUsername(nombres, apellidos);
  }

  @Get()
  @Roles('ADMIN', 'OPERADOR')
  findAll(
    @Query()
    pagination: PaginationQueryDto,
  ) {
    return this.usersService.findAll(pagination);
  }

  @Get('cedula/:cedula')
  @Roles('ADMIN', 'OPERADOR')
  findByCedula(
    @Param('cedula', CedulaPipe)
    cedula: string,
  ) {
    return this.usersService.findByCedula(cedula);
  }

  @Get('me')
  async profile(@CurrentUser() user: AuthenticatedUser) {
    return { ...(await this.usersService.getProfile(user.userId)), roles: user.roles };
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Get(':id')
  @Roles('ADMIN', 'OPERADOR')
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ) {
    return this.usersService.findOne(id);
  }

  @Get(':id/avatar')
  @Roles('ADMIN', 'OPERADOR')
  avatar(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.usersService.getAvatar(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,

    @Body()
    dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/password')
  @Roles('ADMIN')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.usersService.resetPassword(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ): Promise<void> {
    await this.usersService.remove(id);
  }
}
