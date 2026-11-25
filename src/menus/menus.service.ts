import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Modulo } from '../modulos/entities/modulo.entity.js';
import { RoleModulo } from '../modulos/entities/role-modulo.entity.js';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto.js';
import { Menu } from './entities/menu.entity.js';

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  items?: MenuItem[];
}

function toTree(rows: Menu[]): MenuItem[] {
  const byParent = new Map<string | null, Menu[]>();
  for (const row of rows) {
    const siblings = byParent.get(row.padreId) ?? [];
    siblings.push(row);
    byParent.set(row.padreId, siblings);
  }

  function children(parentId: string | null): MenuItem[] {
    return (byParent.get(parentId) ?? []).map(row => {
      const items = children(row.id);
      return {
        id: row.id,
        label: row.label,
        icon: row.icon ?? undefined,
        url: row.url ?? undefined,
        items: items.length ? items : undefined,
      };
    });
  }
  return children(null);
}

@Injectable()
export class MenusService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Menu) private readonly menus: Repository<Menu>,
    @InjectRepository(RoleModulo) private readonly assignments: Repository<RoleModulo>,
    @InjectRepository(Modulo) private readonly modulos: Repository<Modulo>,
  ) {}

  async findAll(moduloId: string) {
    if (!(await this.modulos.existsBy({ id: moduloId }))) {
      throw new NotFoundException('Módulo no encontrado');
    }
    return this.menus.find({
      where: { moduloId },
      order: { orden: 'ASC', label: 'ASC', id: 'ASC' },
    });
  }

  async findOne(moduloId: string, id: string, menus = this.menus) {
    const menu = await menus.createQueryBuilder('menu')
      .innerJoin('menu.modulo', 'modulo')
      .where('menu.moduloId = :moduloId AND menu.id = :id', { moduloId, id })
      .getOne();
    if (!menu) throw new NotFoundException('Menú no encontrado');
    return menu;
  }

  create(moduloId: string, dto: CreateMenuDto) {
    return this.withModuleLock(moduloId, async menus => {
      await this.validateParent(menus, moduloId, dto.padreId);
      return menus.save(menus.create({ ...dto, moduloId }));
    });
  }

  update(moduloId: string, id: string, dto: UpdateMenuDto) {
    return this.withModuleLock(moduloId, async menus => {
      const menu = await this.findOne(moduloId, id, menus);
      if (dto.padreId !== undefined) await this.validateParent(menus, moduloId, dto.padreId, id);
      return menus.save(menus.merge(menu, dto));
    });
  }

  remove(moduloId: string, id: string) {
    return this.withModuleLock(moduloId, async menus => {
      await this.findOne(moduloId, id, menus);
      if (await menus.existsBy({ moduloId, padreId: id })) {
        throw new ConflictException('Retira o mueve los menús hijos antes de eliminar el padre');
      }
      await menus.delete({ moduloId, id });
    });
  }

  async forRoles(roles: string[]) {
    if (!roles.length) return [];
    const assignments = await this.assignments.createQueryBuilder('asignacion')
      .innerJoinAndSelect('asignacion.role', 'rol', 'rol.estado = TRUE AND rol.rol IN (:...roles)', { roles })
      .innerJoinAndSelect('asignacion.modulo', 'modulo', 'modulo.estado = TRUE')
      .orderBy('modulo.codigo', 'ASC')
      .getMany();

    const moduleIds = [...new Set(assignments.map(assignment => assignment.moduloId))];
    const rows = moduleIds.length ? await this.menus.find({
      where: { moduloId: In(moduleIds), estado: true },
      order: { orden: 'ASC', label: 'ASC', id: 'ASC' },
    }) : [];
    const rowsByModule = new Map<string, Menu[]>();
    for (const row of rows) {
      const entries = rowsByModule.get(row.moduloId) ?? [];
      entries.push(row);
      rowsByModule.set(row.moduloId, entries);
    }
    const trees = new Map(moduleIds.map(id => [id, toTree(rowsByModule.get(id) ?? [])]));

    return roles.map(rol => {
      const modules = assignments.filter(assignment => assignment.role.rol === rol);
      return {
        rol,
        imagenUrl: modules.find(assignment => assignment.modulo.imagenUrl)?.modulo.imagenUrl ?? null,
        modulos: modules.map(({ modulo }) => ({ id: modulo.id, nombre: modulo.nombre })),
        items: modules.flatMap(assignment => trees.get(assignment.moduloId) ?? []),
      };
    });
  }

  private withModuleLock<T>(moduloId: string, action: (menus: Repository<Menu>) => Promise<T>) {
    return this.dataSource.transaction(async manager => {
      const modulo = await manager.findOne(Modulo, {
        where: { id: moduloId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!modulo) throw new NotFoundException('Módulo no encontrado');
      return action(manager.getRepository(Menu));
    });
  }

  private async validateParent(
    menus: Repository<Menu>, moduloId: string, padreId?: string | null, menuId?: string,
  ) {
    if (!padreId) return;
    const rows = await menus.findBy({ moduloId });
    const ancestors = new Map(rows.map(menu => [menu.id, menu.padreId]));
    const visited = new Set(menuId ? [menuId] : []);
    for (let current: string | null = padreId; current; ) {
      if (visited.has(current)) throw new BadRequestException('La jerarquía del menú no puede contener ciclos');
      const next = ancestors.get(current);
      if (next === undefined) throw new BadRequestException('El menú padre debe pertenecer al mismo módulo');
      visited.add(current);
      current = next;
    }
  }
}
