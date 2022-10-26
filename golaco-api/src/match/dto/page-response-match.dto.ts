import { PageInfoDto } from '../../dto/page-info.dto';
import { ResponseMatchDto } from './response-match.dto';

export class PageResponseMatchDto {
  pageInfo: PageInfoDto;
  data: ResponseMatchDto[];
}
