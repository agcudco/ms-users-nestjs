import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'New' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  label!: string;

  @ApiPropertyOptional({ type: String, nullable: true, example: 'pi pi-fw pi-plus' })
  @IsOptional()
  @Matches(/^pi(?: pi-[a-z0-9-]+)+$/)
  @MaxLength(100)
  icon?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '/inventario' })
  @IsOptional()
  @Matches(/^\/(?![\/\\])[^\\\s]*$/)
  @MaxLength(255)
  url?: string | null;

  @ApiPropertyOptional({ type: String, format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4')
  padreId?: string | null;

  @ApiPropertyOptional({ default: 0 })
  @ValidateIf((_, value) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(2147483647)
  orden?: number;

  @ApiPropertyOptional({ default: true })
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  estado?: boolean;
}

export class UpdateMenuDto extends PartialType(CreateMenuDto, { skipNullProperties: false }) {}
