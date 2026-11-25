import { PartialType } from '@nestjs/swagger';
import { CreateModuloDto } from './create-modulo.dto.js';

export class UpdateModuloDto extends PartialType(CreateModuloDto, { skipNullProperties: false }) {}

