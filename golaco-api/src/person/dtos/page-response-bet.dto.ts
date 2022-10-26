import { bet } from '@prisma/client';
import { PageInfoDto } from '../../dto/page-info.dto';

export class PageResponseBetDto {
  pageInfo: PageInfoDto;
  data: bet[];
}
