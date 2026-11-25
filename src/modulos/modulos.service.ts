import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, QueryFailedError, Repository } from 'typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto/pagination-query.dto.js';
import { CreateModuloDto } from './dto/create-modulo.dto.js';
import { UpdateModuloDto } from './dto/update-modulo.dto.js';
import { Modulo } from './entities/modulo.entity.js';

@Injectable()
export class ModulosService {
  constructor(@InjectRepository(Modulo) private readonly modulos: Repository<Modulo>) {}

  async create(dto: CreateModuloDto): Promise<Modulo> {
    try {
      return await this.modulos.save(this.modulos.create(dto));
    } catch (error) {
      this.rethrowDuplicateCode(error);
    }
  }

  async findAll({ page, limit }: PaginationQueryDto) {
    const [data, total] = await this.modulos.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { codigo: 'ASC' },
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string): Promise<Modulo> {
    const modulo = await this.modulos.findOneBy({ id });
    if (!modulo) throw new NotFoundException('Módulo no encontrado');
    return modulo;
  }

  async update(id: string, dto: UpdateModuloDto): Promise<Modulo> {
    if (Object.values(dto).some(value => value !== undefined)) {
      try {
        await this.modulos.update({ id, fechaEliminacion: IsNull() }, dto);
      } catch (error) {
        this.rethrowDuplicateCode(error);
      }
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.modulos.softDelete({ id, fechaEliminacion: IsNull() });
    if (!result.affected) throw new NotFoundException('Módulo no encontrado');
  }

  private rethrowDuplicateCode(error: unknown): never {
    if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === '23505') {
      throw new ConflictException('El código del módulo ya existe');
    }
    throw error;
  }
}

