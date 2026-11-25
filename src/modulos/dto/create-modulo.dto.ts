import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateModuloDto {
  @ApiProperty({ example: 'INVENTARIO' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsString()
  @Matches(/^[A-Z0-9_]+$/)
  @MinLength(2)
  @MaxLength(50)
  codigo!: string;

  @ApiProperty({ example: 'Inventario' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'Gestión de existencias' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  descripcion?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '/imagenes/inventario.png' })
  @IsOptional()
  @Matches(/^(?:\/(?![\/\\])[^\\\s]*|https:\/\/[^\/\\\s]+[^\\\s]*)$/i)
  @MaxLength(1000)
  imagenUrl?: string | null;

  @ApiPropertyOptional({ default: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  estado?: boolean;
}

