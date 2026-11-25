import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignModuloDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  moduloId!: string;
}

