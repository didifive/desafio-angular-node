import { PageResponseTransactionDto } from './page-response-transaction.dto';
import { ResponsePersonDto } from './response-person.dto';
import { PartialType } from '@nestjs/mapped-types';

export class ResponsePersonTransactionsDto extends PartialType(
  ResponsePersonDto,
) {
  incomingTransactions?: PageResponseTransactionDto;
  outgoingTransactions?: PageResponseTransactionDto;
}
