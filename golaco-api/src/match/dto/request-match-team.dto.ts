import { IsBoolean, IsDecimal, IsInt, IsOptional } from 'class-validator';

const teamIdValidationMessage = 'Deve ser um Id de time válido';
const teamResultValidationMessage = 'Deve ser um número inteiro';
const teamOrderValidationMessage = 'Deve ser um número inteiro';
const oddsValidationMessage =
  'Deve ser um número decimal representando com 2 casas decimais';
const winnerValidationMessage =
  'Deve ser um boolean: true para ganhador da partida';

export class RequestMatchTeamDto {
  @IsInt({
    message: teamIdValidationMessage,
  })
  teamId: number;

  @IsOptional()
  @IsInt({
    message: teamResultValidationMessage,
  })
  teamResult?: number;

  @IsDecimal({ decimal_digits: '2,' }, { message: oddsValidationMessage })
  odds: string;

  @IsInt({
    message: teamOrderValidationMessage,
  })
  teamOrder: number;

  @IsOptional()
  @IsBoolean({
    message: winnerValidationMessage,
  })
  winner?: boolean;
}
