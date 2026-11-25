import { CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Role } from '../../roles/entities/role.entity.js';
import { Modulo } from './modulo.entity.js';

@Entity('role_modulos')
@Index('IDX_role_modulos_modulo', ['moduloId'])
export class RoleModulo {
  @PrimaryColumn({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @PrimaryColumn({ name: 'modulo_id', type: 'uuid' })
  moduloId!: string;

  @ManyToOne(() => Role, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Relation<Role>;

  @ManyToOne(() => Modulo, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modulo_id' })
  modulo!: Relation<Modulo>;

  @CreateDateColumn({ name: 'fecha_asignacion' })
  fechaAsignacion!: Date;
}

