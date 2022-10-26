import {
  IsIn,
  IsISO8601,
  IsOptional,
  Length,
  ValidateNested,
} from 'class-validator';
import { RequestMatchTeamDto } from './request-match-team.dto';

const nameValidationMessage =
  'O nome deve conter no mínimo 3 e máximo de 255 caracteres';

const groupRoundValidationMessage =
  'A rodada do grupo deve conter no mínimo 3 e máximo de 255 caracteres';

const matchDateValidationMessage = 'Deve ser informada data em padrão válido';

const statusValidationMessage = 'Deve ser informado um status válido';

export class RequestMatchDto {
  @Length(3, 255, {
    message: nameValidationMessage,
  })
  name: string;

  @Length(3, 255, {
    message: groupRoundValidationMessage,
  })
  groupRound: string;

  @IsISO8601({ message: matchDateValidationMessage })
  matchStart: string;

  @IsOptional()
  @IsISO8601({ message: matchDateValidationMessage })
  matchEnd?: string;

  @IsOptional()
  @IsIn(['created', 'closed'], { message: statusValidationMessage })
  status?: string;

  @IsOptional()
  @ValidateNested()
  teams?: RequestMatchTeamDto[];
}
