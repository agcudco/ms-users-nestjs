import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

export class PreviewUsernameDto extends PickType(CreateUserDto, ['nombres', 'apellidos'] as const) {}
