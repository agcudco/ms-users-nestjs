import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity('modulos')
@Index('UQ_modulos_codigo', ['codigo'], { unique: true })
export class Modulo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  codigo!: string;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  descripcion!: string | null;

  @Column({ name: 'imagen_url', type: 'varchar', length: 1000, nullable: true })
  imagenUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  estado!: boolean;

  @VersionColumn()
  version!: number;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion!: Date;

  @DeleteDateColumn({ name: 'fecha_eliminacion' })
  fechaEliminacion!: Date | null;
}

