import { Module } from '@nestjs/common';
import { BetService } from './bet.service';
import { BetControllerV1 } from './bet.controller.v1';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [BetControllerV1],
  providers: [BetService, PrismaService, UserService],
})
export class BetModule {}
