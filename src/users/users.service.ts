import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { IsNull, Like, QueryFailedError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { User } from './entities/user.entity.js';
import { Role } from '../roles/entities/role.entity.js';
import { UserRole } from '../user-roles/entities/user-role.entity.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto.js';

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as {
    code?: string;
  };

  return driverError?.code === '23505';
}

function usernameBase(nombres: string, apellidos: string): string {
  const words = (value: string) => value.trim().split(/\s+/)
    .map(word => word.normalize('NFKD').toLowerCase().replace(/[^a-z]/g, ''))
    .filter(Boolean);
  const [firstName, secondName] = words(nombres);
  const [firstSurname, secondSurname] = words(apellidos);
  if (!firstName || !firstSurname) {
    throw new BadRequestException('Ingresa nombres y apellidos válidos para generar el usuario');
  }
  return `${firstName[0]}${secondName?.[0] ?? ''}${firstSurname}${secondSurname?.[0] ?? ''}`.slice(0, 50);
}

async function availableUsername(users: Repository<User>, base: string): Promise<string> {
  const taken = await users.find({
    where: { username: Like(`${base.slice(0, 40)}%`) },
    select: { username: true },
    withDeleted: true,
  });
  const used = new Set(taken.map(user => user.username));
  let username = base;
  for (let number = 1; used.has(username); number++) {
    const suffix = String(number);
    username = base.slice(0, 50 - suffix.length) + suffix;
  }
  return username;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const { roleId, ...data } = dto;
    const base = usernameBase(data.nombres, data.apellidos);
    const passwordHash = await argon2.hash(data.cedula, { type: argon2.argon2id });

    for (;;) {
      try {
        return await this.usersRepository.manager.transaction(async manager => {
          if (roleId && !(await manager.findOne(Role, {
            where: { id: roleId, estado: true },
            lock: { mode: 'pessimistic_read' },
          }))) throw new NotFoundException('Rol activo no encontrado');
          const users = manager.getRepository(User);
          const username = await availableUsername(users, base);
          const { id } = await users.save(users.create({ ...data, username, passwordHash }));
          if (roleId) await manager.insert(UserRole, { userId: id, roleId });
          return users.findOneOrFail({ where: { id }, relations: { userRoles: { role: true } } });
        });
      } catch (error) {
        if (error instanceof QueryFailedError &&
          (error.driverError as { constraint?: string }).constraint === 'UQ_users_username') continue;
        if (isUniqueViolation(error)) {
          throw new ConflictException('Los datos del usuario entran en conflicto con un registro existente');
        }
        throw error;
      }
    }
  }

  async previewUsername(nombres: string, apellidos: string) {
    return { username: await availableUsername(this.usersRepository, usernameBase(nombres, apellidos)) };
  }

  async getProfile(id: string) {
    const user = await this.usersRepository.createQueryBuilder('usuario')
      .select(['usuario.username', 'usuario.nombres', 'usuario.apellidos', 'usuario.email',
        'usuario.telefono', 'usuario.fechaNacimiento', 'usuario.avatar'])
      .where('usuario.id = :id AND usuario.estado = TRUE', { id })
      .getOne();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { username, nombres, apellidos, email, telefono, fechaNacimiento, avatar } = user;
    return { username, nombres, apellidos, email, telefono, fechaNacimiento, avatar };
  }

  async getAvatar(id: string) {
    const user = await this.usersRepository.createQueryBuilder('usuario')
      .select(['usuario.id', 'usuario.avatar'])
      .where('usuario.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return { avatar: user.avatar };
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    if (Object.values(dto).some(value => value !== undefined)) {
      try {
        const result = await this.usersRepository.update({ id, estado: true, fechaEliminacion: IsNull() }, dto);
        if (!result.affected) throw new NotFoundException('Usuario no encontrado');
      } catch (error) {
        if (isUniqueViolation(error)) throw new ConflictException('El correo o teléfono ya está en uso');
        throw error;
      }
    }
    return this.getProfile(id);
  }

  async findAll(pagination: PaginationQueryDto) {
    const { page, limit } = pagination;

    const [data, total] = await this.usersRepository.findAndCount({
      relations: {
        userRoles: {
          role: true,
        },
      },

      skip: (page - 1) * limit,

      take: limit,

      order: {
        fechaCreacion: 'DESC',
      },
    });

    return {
      data,

      meta: {
        page,
        limit,
        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },

      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByCedula(cedula: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        cedula,
      },

      relations: {
        userRoles: {
          role: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async exists(id: string): Promise<boolean> {
    return this.usersRepository.exists({
      where: {
        id,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      id,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    Object.assign(user, dto);

    try {
      await this.usersRepository.save(user);
      return this.findOne(id);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          'Los datos del usuario entran en conflicto con un registro existente',
        );
      }
      throw error;
    }
  }

  async resetPassword(id: string, { password, confirmPassword }: ResetPasswordDto): Promise<void> {
    if (password !== confirmPassword) throw new BadRequestException('Las contraseñas no coinciden');
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const result = await this.usersRepository.update(
      { id, fechaEliminacion: IsNull() },
      { passwordHash, tokenVersion: () => '"token_version" + 1' },
    );
    if (!result.affected) throw new NotFoundException('Usuario no encontrado');
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async findForAuthentication(identifier: string): Promise<User | null> {
    const normalized = identifier.trim().toLowerCase();

    return (
      this.usersRepository
        .createQueryBuilder('user')

        /*
         * passwordHash tiene:
         *
         * select: false
         *
         * por eso se solicita explícitamente.
         */
        .addSelect('user.passwordHash')

        .where(
          `
        (
          LOWER(user.username) = :identifier
          OR
          LOWER(user.email) = :identifier
        )
      `,
          {
            identifier: normalized,
          },
        )

        .andWhere('user.estado = :estado', {
          estado: true,
        })

        .andWhere('user.fechaEliminacion IS NULL')

        .getOne()
    );
  }

  async findActiveWithRoles(id: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')

      .leftJoinAndSelect(
        'user.userRoles',
        'userRole',
        `
        userRole.estado = :userRoleActive
      `,
        {
          userRoleActive: true,
        },
      )

      .leftJoinAndSelect(
        'userRole.role',
        'role',
        `
        role.estado = :roleActive
        AND role.fechaEliminacion IS NULL
      `,
        {
          roleActive: true,
        },
      )

      .where('user.id = :id', {
        id,
      })

      .andWhere('user.estado = :userActive', {
        userActive: true,
      })

      .andWhere('user.fechaEliminacion IS NULL')

      .getOne();
  }

  async incrementTokenVersion(userId: string): Promise<void> {
    const result = await this.usersRepository.increment(
      {
        id: userId,

        estado: true,

        fechaEliminacion: IsNull(),
      },
      'tokenVersion',
      1,
    );

    if (!result.affected) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }
}
