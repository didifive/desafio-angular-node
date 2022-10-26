import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamControllerV1 } from './team.controller.v1';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';

@Module({
  controllers: [TeamControllerV1],
  providers: [TeamService, PrismaService, UserService],
})
export class TeamsModule {}
