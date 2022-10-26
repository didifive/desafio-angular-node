import { IsIn, IsInt, IsOptional, Length } from 'class-validator';

const usernameValidationMessage =
  'O usuário deve conter de 3 até 255 caracteres';
const passwordValidationMessage = 'A senha deve conter de 6 até 32 caracteres';
const roleValidationMessage = 'O perfil deve ser USER ou ADMIN';
const personIdValidationMessage =
  'Deve ser um número inteiro que corresponde ao Id válido de uma pessoa';

export class RequestUserDto {
  @Length(3, 255, {
    message: usernameValidationMessage,
  })
  username: string;

  @IsOptional()
  @Length(6, 32, {
    message: passwordValidationMessage,
  })
  password: string;

  @IsOptional()
  @IsIn(['USER', 'ADMIN'], { message: roleValidationMessage })
  role?: string;

  @IsInt({
    message: personIdValidationMessage,
  })
  personId: number;
}
