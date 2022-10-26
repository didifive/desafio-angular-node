import { ResponseMatchTeamDto } from './response-match-team.dto';

export class ResponseMatchDto {
  id: number;
  name: string;
  groupRound: string;
  matchStart: string;
  matchEnd?: string;
  status: string;
  teams?: ResponseMatchTeamDto[];
}
