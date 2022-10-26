import { IsDecimal, IsInt } from 'class-validator';

const personIdValidationMessage =
  'Deve ser um número inteiro que corresponde ao Id válido de uma pessoa';
const matchIdValidationMessage =
  'Deve ser um número inteiro que corresponde ao Id válido de uma pessoa';
const teamIdValidationMessage =
  'Deve ser um número inteiro que corresponde ao Id válido de uma pessoa';
const amountValidationMessage =
  'Deve ser um número decimal representando o valor em espécie';

export class RequestBetDto {
  @IsInt({
    message: personIdValidationMessage,
  })
  personId: number;

  @IsInt({
    message: matchIdValidationMessage,
  })
  matchId: number;

  @IsInt({
    message: teamIdValidationMessage,
  })
  teamId: number;

  @IsDecimal({ decimal_digits: '2,' }, { message: amountValidationMessage })
  amount: string;
}
