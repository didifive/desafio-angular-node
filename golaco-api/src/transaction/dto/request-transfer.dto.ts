import { IsDecimal, IsInt, Length } from 'class-validator';

const nameValidationMessage =
  'O nome deve conter no mínimo 3 e máximo de 255 caracteres';
const personIdValidationMessage =
  'Deve ser um número inteiro que corresponde ao Id válido de uma pessoa';
const amountValidationMessage =
  'Deve ser um número decimal representando o valor em espécie';

export class RequestTransferDto {
  @Length(3, 255, {
    message: nameValidationMessage,
  })
  name: string;

  @IsInt({
    message: personIdValidationMessage,
  })
  receiver: number;

  @IsInt({
    message: personIdValidationMessage,
  })
  payer: number;

  @IsDecimal({ decimal_digits: '2,' }, { message: amountValidationMessage })
  amount: string;
}
