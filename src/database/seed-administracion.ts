import type { DataSource } from 'typeorm';
import { Menu } from '../menus/entities/menu.entity.js';
import { Modulo } from '../modulos/entities/modulo.entity.js';
import { RoleModulo } from '../modulos/entities/role-modulo.entity.js';

const menuGroups = [
  {
    label: 'Usuarios', icon: 'pi pi-fw pi-users', children: [
      { label: 'Listado de usuarios', icon: 'pi pi-fw pi-list', section: 'usuarios' },
      { label: 'Roles por usuario', icon: 'pi pi-fw pi-user-edit', section: 'roles-usuario' },
      { label: 'Restablecer contraseña', icon: 'pi pi-fw pi-key', section: 'restablecer-contrasena' },
    ],
  },
  {
    label: 'Roles y permisos', icon: 'pi pi-fw pi-shield', children: [
      { label: 'Listado de roles', icon: 'pi pi-fw pi-list', section: 'roles' },
      { label: 'Módulos por rol', icon: 'pi pi-fw pi-link', section: 'modulos-rol' },
    ],
  },
  {
    label: 'Módulos y navegación', icon: 'pi pi-fw pi-th-large', children: [
      { label: 'Listado de módulos', icon: 'pi pi-fw pi-list', section: 'modulos' },
      { label: 'Menús por módulo', icon: 'pi pi-fw pi-sitemap', section: 'menus' },
    ],
  },
];

function menuId(number: number) {
  return `3d802702-d519-4af4-a246-${String(number).padStart(12, '0')}`;
}

export async function seedAdministracion(dataSource: DataSource, roleId: string) {
  await dataSource.transaction(async manager => {
    const modulos = manager.getRepository(Modulo);
    await modulos.upsert({
      codigo: 'ADMIN',
      nombre: 'Administración',
      descripcion: 'Gestión de usuarios, roles, módulos y menús',
      imagenUrl: '/imagenes/administracion.svg',
      estado: true,
      fechaEliminacion: null,
    }, ['codigo']);

    const { id: moduloId } = await modulos.findOneByOrFail({ codigo: 'ADMIN' });
    await manager.createQueryBuilder().insert().into(RoleModulo).values({ roleId, moduloId }).orIgnore().execute();

    const menus = manager.getRepository(Menu);
    for (const [index, group] of menuGroups.entries()) {
      const padreId = menuId((index + 1) * 10);
      await menus.upsert({
        id: padreId, moduloId, padreId: null, label: group.label,
        icon: group.icon, url: null, orden: index, estado: true,
      }, ['id']);

      await menus.upsert(group.children.map((child, childIndex) => ({
        id: menuId((index + 1) * 10 + childIndex + 1),
        moduloId, padreId, label: child.label, icon: child.icon,
        url: `/roles/ADMIN?seccion=${child.section}`,
        orden: childIndex, estado: true,
      })), ['id']);
    }
  });
}
