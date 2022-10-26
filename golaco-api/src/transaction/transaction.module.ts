import { PrismaService } from '../prisma.service';
import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionControllerV1 } from './transaction.controller.v1';
import { UserService } from '../user/user.service';

@Module({
  controllers: [TransactionControllerV1],
  providers: [TransactionService, PrismaService, UserService],
})
export class TransactionModule {}
