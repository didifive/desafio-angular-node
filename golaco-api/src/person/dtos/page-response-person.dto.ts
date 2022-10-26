import { PageInfoDto } from '../../dto/page-info.dto';
import { ResponsePersonDto } from './response-person.dto';

export class PageResponsePersonDto {
  pageInfo: PageInfoDto;
  data: ResponsePersonDto[];
}
