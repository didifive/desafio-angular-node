import { ResponseUserDto } from './dto/response-user.dto';
import { PageResponseUserDto } from './dto/page-response-user.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RequestUserDto } from './dto/request-user.dto';
import { RequestUserPasswordDto } from './dto/request-user-password.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { ForbiddenException } from '../exceptions';
import { CurrentUser } from '../auth/current-user.decorator';

@Roles(Role.ADMIN)
@Controller({
  path: 'users',
  version: '1',
})
export class UserControllerV1 {
  constructor(private readonly userService: UserService) {}

  @HttpCode(201)
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createUserDto: RequestUserDto,
  ): Promise<ResponseUserDto> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    return this.userService.create(createUserDto, currentUsername);
  }

  @Get()
  async findAll(@Query() params: Params): Promise<PageResponseUserDto> {
    params.page = params.page ? +params.page : 0;
    params.take = params.take ? +params.take : 100;
    return this.userService.findAll(params);
  }

  @Roles(Role.USER)
  @Get(':id')
  async findOne(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ): Promise<ResponseUserDto> {
    this.checkOwnUser(currentUser, +id);
    return this.userService.findOne(+id);
  }

  @Put(':id')
  async update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateUserDto: RequestUserDto,
  ): Promise<ResponseUserDto> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    return this.userService.update(+id, updateUserDto, currentUsername);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ): Promise<void> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    this.checkNotOwnUser(currentUser, +id);
    await this.userService.remove(+id, currentUsername);
  }

  @HttpCode(204)
  @Patch(':id/password')
  async updatePassword(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() passwordUserDto: RequestUserPasswordDto,
  ): Promise<void> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    this.checkOnlyOwnUser(currentUser, +id);
    await this.userService.updatePassword(
      +id,
      passwordUserDto,
      currentUsername,
    );
  }

  private checkOwnUser(user: CurrentUser, id: number) {
    if (user.role === 'USER' && user.id !== +id)
      throw new ForbiddenException('Acesso negado');
  }

  private checkOnlyOwnUser(user: CurrentUser, id: number) {
    if (user.id !== +id) throw new ForbiddenException('Acesso negado');
  }

  private checkNotOwnUser(user: CurrentUser, id: number) {
    if (user.id === +id) throw new ForbiddenException('Acesso negado');
  }
}
