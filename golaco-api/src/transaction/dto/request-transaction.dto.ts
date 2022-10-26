import { IsDecimal, IsInt } from 'class-validator';

const personIdValidationMessage =
  'Deve ser um número inteiro que corresponde ao Id válido de uma pessoa';
const amountValidationMessage =
  'Deve ser um número decimal representando o valor em espécie';

export class RequestTransactionDto {
  @IsInt({
    message: personIdValidationMessage,
  })
  personId: number;

  @IsDecimal({ decimal_digits: '2,' }, { message: amountValidationMessage })
  amount: string;
}
