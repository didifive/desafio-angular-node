import { PrismaService } from '../prisma.service';
import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchControllerV1 } from './match.controller.v1';
import { UserService } from '../user/user.service';

@Module({
  controllers: [MatchControllerV1],
  providers: [MatchService, PrismaService, UserService],
})
export class MatchModule {}
