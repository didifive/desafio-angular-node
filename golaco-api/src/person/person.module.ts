import { PrismaService } from './../prisma.service';
import { Module } from '@nestjs/common';
import { PersonService } from './person.service';
import { PersonControllerV1 } from './person.controller.v1';
import { UserService } from '../user/user.service';

@Module({
  controllers: [PersonControllerV1],
  providers: [PersonService, PrismaService, UserService],
})
export class PersonModule {}
