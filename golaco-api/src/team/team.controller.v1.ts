import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  Put,
  Query,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { RequestTeamDto } from './dto/request-team.dto';
import { ResponseTeamDto } from './dto/response-team.dto';
import { PageResponseTeamDto } from './dto/page-response-team.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserService } from '../user/user.service';

@Roles(Role.ADMIN)
@Controller({
  path: 'teams',
  version: '1',
})
export class TeamControllerV1 {
  constructor(
    private readonly teamService: TeamService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(201)
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() requestTeamDto: RequestTeamDto,
  ): Promise<ResponseTeamDto> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    return this.teamService.create(requestTeamDto, currentUsername);
  }

  @Roles(Role.USER)
  @Get()
  async findAll(@Query() params: Params): Promise<PageResponseTeamDto> {
    params.page = params.page ? +params.page : 0;
    params.take = params.take ? +params.take : 100;
    return this.teamService.findAll(params);
  }

  @Roles(Role.USER)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseTeamDto> {
    return this.teamService.findOne(+id);
  }

  @Put(':id')
  async update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() requestTeamDto: RequestTeamDto,
  ): Promise<ResponseTeamDto> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    return this.teamService.update(+id, requestTeamDto, currentUsername);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ): Promise<void> {
    const currentUsername = await this.userService.loggedUsername(currentUser);
    return this.teamService.remove(+id, currentUsername);
  }
}
