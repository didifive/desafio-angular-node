import { Controller, Post, Body } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { RequestTransactionDto } from './dto/request-transaction.dto';
import { RequestTransferDto } from './dto/request-transfer.dto';
import { ResponseTransactionDto } from './dto/response-transaction.dto';
import { ForbiddenException } from '../exceptions';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserService } from '../user/user.service';

@Controller({
  path: 'transactions',
  version: '1',
})
export class TransactionControllerV1 {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly userService: UserService,
  ) {}

  @Post('transfer')
  async create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() requestTransferDto: RequestTransferDto,
  ): Promise<ResponseTransactionDto> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    this.checkOnlyOwnUser(currentUser, requestTransferDto.payer);
    return this.transactionService.create(requestTransferDto, currentUsername);
  }

  @Post('deposit')
  async createDeposit(
    @CurrentUser() currentUser: CurrentUser,
    @Body() requestTransactionDto: RequestTransactionDto,
  ): Promise<ResponseTransactionDto> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    this.checkOnlyOwnUser(currentUser, requestTransactionDto.personId);
    return this.transactionService.createDeposit(
      requestTransactionDto,
      currentUsername,
    );
  }

  @Post('withdraw')
  async createWithDraw(
    @CurrentUser() currentUser: CurrentUser,
    @Body() requestTransactionDto: RequestTransactionDto,
  ): Promise<ResponseTransactionDto> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    this.checkOnlyOwnUser(currentUser, requestTransactionDto.personId);
    return this.transactionService.createWithdraw(
      requestTransactionDto,
      currentUsername,
    );
  }

  private checkOnlyOwnUser(user: CurrentUser, id: number) {
    if (user.person !== +id) throw new ForbiddenException('Acesso negado');
  }
}
