import { PageResponseBetDto } from './page-response-bet.dto';
import { ResponsePersonDto } from './response-person.dto';
import { PartialType } from '@nestjs/mapped-types';

export class ResponsePersonBetsDto extends PartialType(ResponsePersonDto) {
  bets?: PageResponseBetDto;
}
