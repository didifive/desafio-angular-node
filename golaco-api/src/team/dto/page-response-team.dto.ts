import { PageInfoDto } from '../../dto/page-info.dto';
import { ResponseTeamDto } from './response-team.dto';

export class PageResponseTeamDto {
  pageInfo: PageInfoDto;
  data: ResponseTeamDto[];
}
