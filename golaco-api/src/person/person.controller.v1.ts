import { ResponsePersonBetsDto } from './dtos/response-person-bets.dto copy';
import { ResponsePersonTransactionsDto } from './dtos/response-person-transactions.dto';
import { ForbiddenException } from '../exceptions';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  Put,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { RequestPersonDto } from './dtos/request-person.dto';
import { PageResponsePersonDto } from './dtos/page-response-person.dto';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { ResponsePersonDto } from './dtos/response-person.dto';
import { UserService } from '../user/user.service';

@Roles(Role.ADMIN)
@Controller({
  path: 'people',
  version: '1',
})
export class PersonControllerV1 {
  constructor(
    private readonly personService: PersonService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(201)
  @Post()
  async create(
    @CurrentUser() currentUser: CurrentUser,
    @Body() requestPersonDto: RequestPersonDto,
  ) {
    const username = await this.userService.loggedUsername(currentUser);
    return this.personService.create(requestPersonDto, username);
  }

  @Get()
  async findAll(@Query() params: Params): Promise<PageResponsePersonDto> {
    params.page = params.page ? +params.page : 0;
    params.take = params.take ? +params.take : 100;
    return this.personService.findAll(params);
  }

  @Roles(Role.USER)
  @Get(':id')
  async findOne(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    this.checkOwnUser(user, +id);
    return this.personService.findOne(+id);
  }

  @Put(':id')
  async update(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
    @Body() updatePersonDto: RequestPersonDto,
  ): Promise<ResponsePersonDto> {
    const username = await this.userService.loggedUsername(currentUser);
    return this.personService.update(+id, updatePersonDto, username);
  }

  @HttpCode(204)
  @Delete(':id')
  async remove(
    @CurrentUser() currentUser: CurrentUser,
    @Param('id') id: string,
  ) {
    const username = await this.userService.loggedUsername(currentUser);
    return this.personService.remove(+id, username);
  }

  @Roles(Role.USER)
  @Get(':id/transactions')
  async findTransactionsByPerson(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Query() params: Params,
  ): Promise<ResponsePersonTransactionsDto> {
    this.checkOwnUser(user, +id);
    params.page = params.page ? +params.page : 0;
    params.take = params.take ? +params.take : 100;
    return this.personService.findTransactionsByPerson(+id, params);
  }

  @Roles(Role.USER)
  @Get(':id/bets')
  async findBetsByPerson(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Query() params: Params,
  ): Promise<ResponsePersonBetsDto> {
    this.checkOwnUser(user, +id);
    params.page = params.page ? +params.page : 0;
    params.take = params.take ? +params.take : 100;
    return this.personService.findBetsByPerson(+id, params);
  }

  private checkOwnUser(user: CurrentUser, id: number) {
    if (user.role === 'USER' && user.person !== +id)
      throw new ForbiddenException('Acesso negado');
  }
}
