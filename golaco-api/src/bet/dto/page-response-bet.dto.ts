import { PageInfoDto } from '../../dto/page-info.dto';
import { ResponseBetDto } from './response-bet.dto';

export class PageResponseBetDto {
  pageInfo: PageInfoDto;
  data: ResponseBetDto[];
}
