import { Length } from 'class-validator';

const nameValidationMessage =
  'O nome deve conter no mínimo 3 e máximo de 255 caracteres';
const imageValidationMessage =
  'O caminho da imagem deve conter no mínimo 3 e máximo de 255 caracteres';

export class RequestTeamDto {
  @Length(3, 255, {
    message: nameValidationMessage,
  })
  name: string;

  @Length(3, 255, {
    message: imageValidationMessage,
  })
  teamImage: string;
}
