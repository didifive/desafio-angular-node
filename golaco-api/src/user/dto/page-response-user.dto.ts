import { PageInfoDto } from 'src/dto/page-info.dto';
import { ResponseUserDto } from './response-user.dto';

export class PageResponseUserDto {
  pageInfo: PageInfoDto;
  data: ResponseUserDto[];
}
