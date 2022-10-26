import { Injectable } from '@nestjs/common';
import { bet } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { PageInfoDto } from '../dto/page-info.dto';
import {
  DataViolationException,
  EntityNotFoundException,
  ForbiddenException,
} from '../exceptions';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { PageResponseBetDto } from './dto/page-response-bet.dto';
import { RequestBetDto } from './dto/request-bet.dto';
import { ResponseBetDto } from './dto/response-bet.dto';

@Injectable()
export class BetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(
    createBetDto: RequestBetDto,
    currentUser: CurrentUser,
  ): Promise<ResponseBetDto> {
    const username = await this.userService.loggedUsername(currentUser);

    const bet: bet = this.toBetModel(createBetDto, username);

    let createdBet: bet;
    try {
      createdBet = await this.prisma.bet.create({
        data: bet,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    const today = new Date();
    await this.prisma.transaction.create({
      data: {
        name: `Aposta #${createdBet.id} realizada`,
        amount: createdBet.amount,
        dateTimeAt: today,
        status: 'done',
        receiver: 1,
        payer: createdBet.personId,
        betId: createdBet.id,
        lastUsername: username,
      },
    });

    return this.toResponseBetDto(createdBet);
  }

  async findAll(params: Params): Promise<PageResponseBetDto> {
    const { page, take, orderBy } = params;
    const countBet: number = await this.prisma.bet.count();
    const skip: number = page * take;
    const pageInfo: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countBet / take) - 1,
      totalItems: countBet,
    };
    const betList = await this.prisma.bet.findMany({
      skip,
      take,
      orderBy,
    });

    const responseBetDtoList: ResponseBetDto[] = [];
    betList.forEach((bet: bet) =>
      responseBetDtoList.push(this.toResponseBetDto(bet)),
    );

    return this.toPageResponseBetDto(responseBetDtoList, pageInfo);
  }

  async findOne(id: number, currentUser: CurrentUser): Promise<ResponseBetDto> {
    const bet = await this.getBet(id);

    this.checkOnlyOwnUser(currentUser, bet.personId);

    return this.toResponseBetDto(bet);
  }

  async remove(id: number, currentUser: CurrentUser): Promise<void> {
    const username = await this.userService.loggedUsername(currentUser);

    const bet = await this.getBet(id);

    await this.updateBet(bet, username);

    try {
      await this.prisma.person.delete({
        where: { id: id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    const today = new Date();
    await this.prisma.transaction.create({
      data: {
        name: `Aposta #${bet.id} excluída`,
        amount: bet.amount,
        dateTimeAt: today,
        status: 'done',
        receiver: bet.personId,
        payer: 1,
        betId: bet.id,
        lastUsername: username,
      },
    });
  }

  private toResponseBetDto(bet: bet): ResponseBetDto {
    if (bet[0]) bet = bet[0];

    const responseBetDto: ResponseBetDto = {
      id: bet.id,
      personId: bet.personId,
      matchId: bet.matchId,
      teamId: bet.teamId,
      dateTimeAt: bet.dateTimeAt.toISOString(),
      amount: bet.amount.toNumber(),
      status: bet.status,
    };

    return responseBetDto;
  }

  private toPageResponseBetDto(
    responseBetDtoList: ResponseBetDto[],
    page: PageInfoDto,
  ): PageResponseBetDto {
    page.currentPageItems = responseBetDtoList.length;
    if (page.lastPage === -1) page.lastPage = 0;
    const pageResponseBetDto: PageResponseBetDto = {
      pageInfo: page,
      data: responseBetDtoList,
    };
    return pageResponseBetDto;
  }

  private toBetModel(requestBetDto: RequestBetDto, username: string): bet {
    const today = new Date();
    const amount = new Decimal(requestBetDto.amount);
    return {
      id: undefined,
      dateTimeAt: today,
      amount: amount,
      status: 'done',
      personId: requestBetDto.personId,
      matchId: requestBetDto.matchId,
      teamId: requestBetDto.teamId,
      lastUsername: username,
    };
  }

  private async getBet(id: number): Promise<bet> {
    try {
      return await this.prisma.bet.findUniqueOrThrow({
        where: { id: id },
      });
    } catch (err: any) {
      throw new EntityNotFoundException('Aposta', id);
    }
  }

  private async updateBet(bet: bet, username: string): Promise<bet> {
    bet.lastUsername = username;
    try {
      return await this.prisma.bet.update({
        data: bet,
        where: { id: bet.id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  private checkOnlyOwnUser(user: CurrentUser, id: number) {
    if (user.role === 'USER' && user.person !== +id)
      throw new ForbiddenException('Acesso negado');
  }
}
