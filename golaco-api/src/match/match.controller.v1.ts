import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  Query,
} from '@nestjs/common';
import { MatchService } from './match.service';
import { RequestMatchDto } from './dto/request-match.dto';
import { ResponseMatchDto } from './dto/response-match.dto';
import { PageResponseMatchDto } from './dto/page-response-match.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';

@Roles(Role.ADMIN)
@Controller({
  path: 'matches',
  version: '1',
})
export class MatchControllerV1 {
  constructor(private readonly matchService: MatchService) {}

  @HttpCode(201)
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() createMatchDto: RequestMatchDto,
  ): Promise<ResponseMatchDto> {
    return this.matchService.create(createMatchDto, currentUser);
  }

  @Roles(Role.USER)
  @Get()
  async findAll(@Query() params: Params): Promise<PageResponseMatchDto> {
    params.page = params.page ? +params.page : 0;
    params.take = params.take ? +params.take : 100;
    return this.matchService.findAll(params);
  }

  @Roles(Role.USER)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ResponseMatchDto> {
    return this.matchService.findOne(+id);
  }

  @Put(':id')
  async update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updateMatchDto: RequestMatchDto,
  ): Promise<ResponseMatchDto> {
    return this.matchService.update(+id, updateMatchDto, currentUser);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.matchService.remove(+id, currentUser);
  }
}
