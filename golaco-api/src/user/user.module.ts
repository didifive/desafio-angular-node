import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserControllerV1 } from './user.controller.v1';
import { PrismaService } from '.././prisma.service';

@Module({
  controllers: [UserControllerV1],
  providers: [UserService, PrismaService],
  exports: [UserService, PrismaService],
})
export class UserModule {}
