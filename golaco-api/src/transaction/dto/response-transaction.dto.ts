export class ResponseTransactionDto {
  id: number;
  name: string;
  dateTimeAt: string;
  receiver: number;
  payer: number;
  betId?: number;
  amount: number;
  status: string;
}
