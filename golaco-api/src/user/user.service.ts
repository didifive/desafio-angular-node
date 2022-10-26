import { RequestUserPasswordDto } from './dto/request-user-password.dto';
import { Injectable } from '@nestjs/common';
import { user } from '@prisma/client';
import { PageInfoDto } from 'src/dto/page-info.dto';
import {
  DataViolationException,
  EntityNotFoundException,
} from '.././exceptions';
import { PrismaService } from '.././prisma.service';
import { PageResponseUserDto } from './dto/page-response-user.dto';
import { RequestUserDto } from './dto/request-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { RequestUserModel } from './models/request-user.model';
import { compareSync, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    requestUserDto: RequestUserDto,
    currentUsername: string,
  ): Promise<ResponseUserDto> {
    const user: RequestUserModel = this.toRequestUserModel(
      requestUserDto,
      currentUsername,
    );

    let createdUser: user;
    try {
      createdUser = await this.prisma.user.create({
        data: user,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    return this.toResponseUserDto(createdUser);
  }

  async findAll(params: Params): Promise<PageResponseUserDto> {
    const { page, take, orderBy } = params;
    const countUsers: number = await this.prisma.user.count();
    const skip: number = page * take;
    const pageInfo: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countUsers / take) - 1,
      totalItems: countUsers,
    };
    const userList = await this.prisma.user.findMany({
      skip,
      take,
      orderBy,
    });

    const responseUserDtoList: ResponseUserDto[] = [];
    userList.forEach((user: user) =>
      responseUserDtoList.push(this.toResponseUserDto(user)),
    );

    return this.toPageResponseUserDto(responseUserDtoList, pageInfo);
  }

  async findOne(id: number): Promise<ResponseUserDto> {
    const user = await this.getUser(id);

    return this.toResponseUserDto(user);
  }

  async update(
    id: number,
    updateUserDto: RequestUserDto,
    currentUsername: string,
  ): Promise<ResponseUserDto> {
    const user = await this.getUser(id);

    user.username = updateUserDto.username;
    if (updateUserDto.role) user.role = updateUserDto.role;

    const updatedUser = await this.updateUser(user, currentUsername);

    return this.toResponseUserDto(updatedUser);
  }

  async updatePassword(
    id: number,
    passwordUserDto: RequestUserPasswordDto,
    currentUsername: string,
  ): Promise<void> {
    const user = await this.getUser(id);

    if (!compareSync(passwordUserDto.oldPassword, user.password))
      throw new DataViolationException('Dados não conferem!');

    user.password = hashSync(passwordUserDto.newPassword, 10);

    await this.updateUser(user, currentUsername);
  }

  async remove(id: number, currentUsername: string) {
    const user = await this.getUser(id);

    await this.updateUser(user, currentUsername);

    try {
      await this.prisma.user.delete({
        where: { id: id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  private toRequestUserModel(
    requestUserDto: RequestUserDto,
    currentUsername: string,
  ): RequestUserModel {
    const role = requestUserDto.role ? requestUserDto.role : 'USER';
    const password = requestUserDto.password
      ? requestUserDto.password
      : 'ChangeMe';
    const passwordHash = hashSync(password, 10);
    return {
      username: requestUserDto.username,
      password: passwordHash,
      role: role,
      personId: requestUserDto.personId,
      lastUsername: currentUsername,
    };
  }

  private toResponseUserDto(user: user): ResponseUserDto {
    if (user[0]) user = user[0];

    if (!user.role) user.role = 'USER';

    const responseUserDto: ResponseUserDto = {
      id: user.id,
      username: user.username,
      role: user.role,
      personId: user.personId,
    };

    return responseUserDto;
  }

  private toPageResponseUserDto(
    responseUserDtoList: ResponseUserDto[],
    page: PageInfoDto,
  ): PageResponseUserDto {
    page.currentPageItems = responseUserDtoList.length;
    if (page.lastPage === -1) page.lastPage = 0;
    const pageResponsePersonDto: PageResponseUserDto = {
      pageInfo: page,
      data: responseUserDtoList,
    };
    return pageResponsePersonDto;
  }

  private async getUser(id: number): Promise<user> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id: id },
      });
    } catch (err: any) {
      throw new EntityNotFoundException('Usuário', id);
    }
  }

  async getUserByUsername(username: string): Promise<user> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { username: username },
      });
    } catch (err: any) {
      throw new EntityNotFoundException('Usuário', null, username);
    }
  }

  private async updateUser(user: user, currentUsername: string): Promise<user> {
    user.lastUsername = currentUsername;
    try {
      return await this.prisma.user.update({
        data: user,
        where: { id: user.id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  async loggedUsername(currentUser: CurrentUser): Promise<string> {
    const user = await this.getUser(currentUser.id);
    return user.username;
  }
}
