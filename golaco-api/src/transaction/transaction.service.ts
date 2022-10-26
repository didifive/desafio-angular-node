import { Decimal } from '@prisma/client/runtime';
import { transaction } from '@prisma/client';
import { ResponseTransactionDto } from './dto/response-transaction.dto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RequestTransactionDto } from './dto/request-transaction.dto';
import { RequestTransferDto } from './dto/request-transfer.dto';
import { DataViolationException } from '../exceptions';

@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    requestTransferDto: RequestTransferDto,
    currentUsername: string,
  ): Promise<ResponseTransactionDto> {
    const transaction: transaction = this.toTransaction(
      requestTransferDto,
      currentUsername,
    );

    await this.checkBalance(
      requestTransferDto.payer,
      +requestTransferDto.amount,
    );

    let createdTransaction: transaction;
    try {
      createdTransaction = await this.prisma.transaction.create({
        data: transaction,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    return this.toResponseTransactionDto(createdTransaction);
  }

  async createDeposit(
    requestTransactionDto: RequestTransactionDto,
    currentUsername: string,
  ): Promise<ResponseTransactionDto> {
    const transaction: transaction = this.toDepositTransaction(
      requestTransactionDto,
      currentUsername,
    );

    let createdTransaction: transaction;
    try {
      createdTransaction = await this.prisma.transaction.create({
        data: transaction,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    return this.toResponseTransactionDto(createdTransaction);
  }

  async createWithdraw(
    requestTransactionDto: RequestTransactionDto,
    currentUsername: string,
  ): Promise<ResponseTransactionDto> {
    const transaction: transaction = this.toWithdrawTransaction(
      requestTransactionDto,
      currentUsername,
    );

    await this.checkBalance(
      requestTransactionDto.personId,
      +requestTransactionDto.amount,
    );

    let createdTransaction: transaction;
    try {
      createdTransaction = await this.prisma.transaction.create({
        data: transaction,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    return this.toResponseTransactionDto(createdTransaction);
  }

  private toTransaction(
    requestTransferDto: RequestTransferDto,
    currentUsername: string,
  ): transaction {
    const today = new Date();
    const amount = new Decimal(requestTransferDto.amount);
    return {
      id: undefined,
      name: requestTransferDto.name,
      payer: requestTransferDto.payer,
      receiver: requestTransferDto.receiver,
      amount: amount,
      dateTimeAt: today,
      status: 'done',
      lastUsername: currentUsername,
      betId: undefined,
    };
  }

  private toDepositTransaction(
    requestTransactionDto: RequestTransactionDto,
    currentUsername: string,
  ): transaction {
    const today = new Date();
    const amount = new Decimal(requestTransactionDto.amount);
    return {
      id: undefined,
      name: 'Depósito',
      payer: undefined,
      receiver: requestTransactionDto.personId,
      amount: amount,
      dateTimeAt: today,
      status: 'done',
      lastUsername: currentUsername,
      betId: undefined,
    };
  }

  private toWithdrawTransaction(
    requestTransactionDto: RequestTransactionDto,
    currentUsername: string,
  ): transaction {
    const today = new Date();
    const amount = new Decimal(requestTransactionDto.amount);
    return {
      id: undefined,
      name: 'Retirada',
      payer: requestTransactionDto.personId,
      receiver: undefined,
      amount: amount,
      dateTimeAt: today,
      status: 'done',
      lastUsername: currentUsername,
      betId: undefined,
    };
  }

  private toResponseTransactionDto(
    savedTransaction: transaction,
  ): ResponseTransactionDto {
    const responseTransactionDto: ResponseTransactionDto = {
      id: savedTransaction.id,
      name: savedTransaction.name,
      dateTimeAt: savedTransaction.dateTimeAt.toISOString(),
      receiver: savedTransaction.receiver,
      payer: savedTransaction.payer,
      betId: savedTransaction.betId,
      amount: savedTransaction.amount.toNumber(),
      status: savedTransaction.status,
    };
    return responseTransactionDto;
  }

  private async checkBalance(personId: number, amount: number) {
    const person = await this.prisma.person.findUniqueOrThrow({
      where: { id: personId },
    });
    const balance = person.balance;

    if (amount > balance.toNumber()) {
      throw new DataViolationException(
        `A pessoa com id ${personId} não possui saldo suficiente para retirar, transferir ou pagar o valor de ${amount}`,
      );
    }
  }
}
