import { Length } from 'class-validator';

const passwordValidationMessage = 'A senha deve conter de 6 até 32 caracteres';
export class RequestUserPasswordDto {
  @Length(1, 32, {
    message: passwordValidationMessage,
  })
  oldPassword: string;

  @Length(6, 32, {
    message: passwordValidationMessage,
  })
  newPassword: string;
}
