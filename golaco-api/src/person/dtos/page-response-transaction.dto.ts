import { transaction } from '@prisma/client';
import { PageInfoDto } from '../../dto/page-info.dto';

export class PageResponseTransactionDto {
  pageInfo: PageInfoDto;
  data: transaction[];
}
