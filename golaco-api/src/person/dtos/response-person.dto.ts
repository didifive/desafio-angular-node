import { PartialType } from '@nestjs/mapped-types';
import { RequestPersonDto } from './request-person.dto';

export class ResponsePersonDto extends PartialType(RequestPersonDto) {
  id: number;
  balance: number;
  balanceAt: string;
}
