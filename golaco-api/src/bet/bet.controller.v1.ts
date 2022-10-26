import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ForbiddenException } from '../exceptions';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '../auth/role.enum';
import { Roles } from '../auth/roles.decorator';
import { BetService } from './bet.service';
import { PageResponseBetDto } from './dto/page-response-bet.dto';
import { RequestBetDto } from './dto/request-bet.dto';
import { ResponseBetDto } from './dto/response-bet.dto';

@Roles(Role.ADMIN)
@Controller({
  path: 'bets',
  version: '1',
})
export class BetControllerV1 {
  constructor(private readonly betService: BetService) {}

  @Roles(Role.USER)
  @HttpCode(201)
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createBetDto: RequestBetDto,
  ): Promise<ResponseBetDto> {
    this.checkOnlyOwnUser(currentUser, createBetDto.personId);
    return this.betService.create(createBetDto, currentUser);
  }

  @Get()
  async findAll(@Query() params: Params): Promise<PageResponseBetDto> {
    params.page = params.page ? +params.page : 0;
    params.take = params.take ? +params.take : 100;
    return this.betService.findAll(params);
  }

  @Roles(Role.USER)
  @Get(':id')
  async findOne(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ): Promise<ResponseBetDto> {
    return this.betService.findOne(+id, currentUser);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.betService.remove(+id, currentUser);
  }

  private checkOnlyOwnUser(user: CurrentUser, id: number) {
    if (user.person !== +id) throw new ForbiddenException('Acesso negado');
  }
}
