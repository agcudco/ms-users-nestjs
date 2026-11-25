import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Modulo } from '../../modulos/entities/modulo.entity.js';

@Entity('menus')
@Index('IDX_menus_modulo_padre', ['moduloId', 'padreId'])
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'modulo_id', type: 'uuid' })
  moduloId!: string;

  @ManyToOne(() => Modulo, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'modulo_id' })
  modulo!: Relation<Modulo>;

  @Column({ name: 'padre_id', type: 'uuid', nullable: true })
  padreId!: string | null;

  @ManyToOne(() => Menu, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'padre_id' })
  padre!: Relation<Menu | null>;

  @Column({ type: 'varchar', length: 100 })
  label!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url!: string | null;

  @Column({ type: 'integer', default: 0 })
  orden!: number;

  @Column({ type: 'boolean', default: true })
  estado!: boolean;
}
