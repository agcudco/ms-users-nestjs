import { Transform } from 'class-transformer';

import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'La cédula debe contener exactamente 10 dígitos',
  })
  cedula: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombres: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  apellidos!: string;

  @IsDateString()
  fechaNacimiento!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(150)
  email!: string;

  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'El teléfono debe contener exactamente 10 dígitos',
  })
  telefono: string;

  @IsOptional()
  @IsBoolean()
  estado?: boolean;

  @IsOptional()
  @IsUUID('4')
  roleId?: string;
}
