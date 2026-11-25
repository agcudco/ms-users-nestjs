import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, Matches, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto.js';

export class UpdateProfileDto extends PartialType(
  PickType(CreateUserDto, ['nombres', 'apellidos', 'email', 'telefono', 'fechaNacimiento'] as const),
  { skipNullProperties: false },
) {
  @IsOptional()
  @MaxLength(65536)
  @Matches(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/)
  avatar?: string | null;
}
