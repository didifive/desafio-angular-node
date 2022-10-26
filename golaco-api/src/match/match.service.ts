import { ResponseMatchTeamDto } from './dto/response-match-team.dto';
import { ResponseMatchDto } from './dto/response-match.dto';
import { Injectable } from '@nestjs/common';
import { bet, match, matchsteams } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { DataViolationException, EntityNotFoundException } from '../exceptions';
import { PrismaService } from '../prisma.service';
import { RequestMatchTeamDto } from './dto/request-match-team.dto';
import { RequestMatchDto } from './dto/request-match.dto';
import { PageInfoDto } from '../dto/page-info.dto';
import { PageResponseMatchDto } from './dto/page-response-match.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class MatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(createMatchDto: RequestMatchDto, currentUser: CurrentUser) {
    const username = await this.userService.loggedUsername(currentUser);

    const match: match = this.toMatchModel(createMatchDto, username);

    let createdMatch: match;
    try {
      createdMatch = await this.prisma.match.create({
        data: match,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    await Promise.all(
      createMatchDto.teams.map(async (matchTeam) => {
        await this.createMatchesTeams(matchTeam, createdMatch.id, username);
      }),
    );

    const responseMatch = await this.prisma.match.findUnique({
      include: {
        matchsteams: true,
      },
      where: { id: createdMatch.id },
    });

    return this.toResponseMatchDto(responseMatch);
  }

  async findAll(params: Params): Promise<PageResponseMatchDto> {
    const { page, take, orderBy } = params;
    const countMatches: number = await this.prisma.match.count();
    const skip: number = page * take;
    const pageInfo: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countMatches / take) - 1,
      totalItems: countMatches,
    };
    const matchList = await this.prisma.match.findMany({
      skip,
      take,
      orderBy,
      include: {
        matchsteams: true,
      },
    });

    const responseMatchDtoList: ResponseMatchDto[] = [];
    matchList.forEach((match: match & { matchsteams: matchsteams[] }) =>
      responseMatchDtoList.push(this.toResponseMatchDto(match)),
    );

    return this.toPageResponseMatchDto(responseMatchDtoList, pageInfo);
  }

  async findOne(id: number): Promise<ResponseMatchDto> {
    const match = await this.getMatch(id);
    return this.toResponseMatchDto(match);
  }

  async update(
    id: number,
    updateMatchDto: RequestMatchDto,
    currentUser: CurrentUser,
  ): Promise<ResponseMatchDto> {
    const username = await this.userService.loggedUsername(currentUser);

    const match = await this.getMatch(id);

    if (match.status === 'closed')
      throw new DataViolationException(
        'Não é possível editar partida já encerrada',
      );

    match.name = updateMatchDto.name;
    match.groupRound = updateMatchDto.groupRound;
    match.matchStart = new Date(updateMatchDto.matchStart);
    match.matchEnd = updateMatchDto.matchEnd
      ? new Date(updateMatchDto.matchEnd)
      : undefined;
    match.status = updateMatchDto.status;

    const updatedMatch = await this.updateMatchWithTeams(match, username);

    if (updatedMatch.status === 'closed') {
      await this.updateWinnerTeam(match);

      const teamsMatchLooser: matchsteams[] =
        await this.prisma.matchsteams.findMany({
          where: { winner: 1, matchId: updatedMatch.id },
        });

      Promise.all(
        teamsMatchLooser.map(async (teamMatchLooser) => {
          const betsLooser: bet[] = await this.prisma.bet.findMany({
            where: { matchId: updatedMatch.id, teamId: teamMatchLooser.teamId },
          });
          Promise.all(
            betsLooser.map(async (bet) => {
              bet.status = 'lose';
              bet.lastUsername = username;
              await this.prisma.bet.update({
                data: bet,
                where: { id: bet.id },
              });
            }),
          );
        }),
      );
    }

    return this.toResponseMatchDto(updatedMatch);
  }

  async remove(id: number, currentUser: CurrentUser) {
    const username = await this.userService.loggedUsername(currentUser);

    const match = await this.getMatch(id);

    await this.checkIfNotExistsBets(match);

    await this.updateMatch(match, username);

    try {
      await this.prisma.match.delete({
        where: { id: id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  private toMatchModel(
    requestMatchDto: RequestMatchDto,
    username: string,
  ): match {
    const status = requestMatchDto.status ? requestMatchDto.status : 'created';
    const start = new Date(requestMatchDto.matchStart);
    const end = requestMatchDto.matchEnd
      ? new Date(requestMatchDto.matchEnd)
      : undefined;
    return {
      id: undefined,
      name: requestMatchDto.name,
      groupRound: requestMatchDto.groupRound,
      matchStart: start,
      matchEnd: end,
      status: status,
      lastUsername: username,
    };
  }

  private async createMatchesTeams(
    requestMatchTeamDto: RequestMatchTeamDto,
    matchId: number,
    username: string,
  ): Promise<matchsteams> {
    const odds = new Decimal(requestMatchTeamDto.odds);
    const matchTeam: matchsteams = {
      matchId: matchId,
      teamId: requestMatchTeamDto.teamId,
      teamResult: requestMatchTeamDto.teamResult,
      teamOrder: requestMatchTeamDto.teamOrder,
      odds: odds,
      winner: 0,
      lastUsername: username,
    };
    return this.prisma.matchsteams.create({
      data: matchTeam,
    });
  }

  private toResponseMatchDto(
    match: match & { matchsteams: matchsteams[] },
  ): ResponseMatchDto {
    if (match[0]) match = match[0];

    const matchEnd = match.matchEnd ? match.matchEnd.toISOString() : undefined;

    const responseMatchDto: ResponseMatchDto = {
      id: match.id,
      name: match.name,
      groupRound: match.groupRound,
      matchStart: match.matchStart.toISOString(),
      matchEnd: matchEnd,
      status: match.status,
      teams: [],
    };

    match.matchsteams.forEach((matchTeam) => {
      responseMatchDto.teams.push(this.toResponseMatchTeamDto(matchTeam));
    });

    return responseMatchDto;
  }

  private toResponseMatchTeamDto(matchTeam: matchsteams): ResponseMatchTeamDto {
    const winner = matchTeam.winner === 1;
    return {
      matchId: matchTeam.matchId,
      teamId: matchTeam.teamId,
      teamResult: matchTeam.teamResult,
      odds: matchTeam.odds.toNumber(),
      teamOrder: matchTeam.teamOrder,
      winner: winner,
    };
  }

  private toPageResponseMatchDto(
    responseMatchDtoList: ResponseMatchDto[],
    page: PageInfoDto,
  ): PageResponseMatchDto {
    page.currentPageItems = responseMatchDtoList.length;
    if (page.lastPage === -1) page.lastPage = 0;
    const pageResponseMatchDto: PageResponseMatchDto = {
      pageInfo: page,
      data: responseMatchDtoList,
    };
    return pageResponseMatchDto;
  }

  private async getMatch(
    id: number,
  ): Promise<match & { matchsteams: matchsteams[] }> {
    try {
      return await this.prisma.match.findUniqueOrThrow({
        include: {
          matchsteams: true,
        },
        where: { id: id },
      });
    } catch (err: any) {
      throw new EntityNotFoundException('Partida', id);
    }
  }

  private async updateMatch(match: match, username: string): Promise<match> {
    match.lastUsername = username;
    try {
      return await this.prisma.match.update({
        where: { id: match.id },
        data: {
          name: match.name,
          groupRound: match.groupRound,
          matchStart: match.matchStart,
          matchEnd: match.matchEnd,
          status: match.status,
          lastUsername: match.lastUsername,
        },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  private async updateMatchWithTeams(
    match: match & { matchsteams: matchsteams[] },
    username: string,
  ): Promise<match & { matchsteams: matchsteams[] }> {
    match.lastUsername = username;
    try {
      await this.prisma.match.update({
        where: {
          id: match.id,
        },
        data: {
          name: match.name,
          groupRound: match.groupRound,
          matchStart: match.matchStart,
          matchEnd: match.matchEnd,
          status: match.status,
          lastUsername: match.lastUsername,
        },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    await Promise.all(
      match.matchsteams.map(async (matchTeam) => {
        matchTeam.matchId = match.id;
        await this.prisma.matchsteams.upsert({
          where: {
            matchId_teamId: {
              matchId: matchTeam.matchId,
              teamId: matchTeam.teamId,
            },
          },
          update: {
            teamResult: matchTeam.teamResult,
            teamOrder: matchTeam.teamOrder,
            odds: matchTeam.odds,
            winner: matchTeam.winner,
            lastUsername: matchTeam.lastUsername,
          },
          create: {
            matchId: matchTeam.matchId,
            teamId: matchTeam.teamId,
            teamResult: matchTeam.teamResult,
            teamOrder: matchTeam.teamOrder,
            odds: matchTeam.odds,
            winner: matchTeam.winner,
            lastUsername: matchTeam.lastUsername,
          },
        });
      }),
    );

    return this.getMatch(match.id);
  }

  private async checkIfNotExistsBets(match: match): Promise<void> {
    const bets: bet[] = await this.prisma.bet.findMany({
      where: { matchId: match.id },
    });

    if (bets.length !== 0)
      throw new DataViolationException(
        'Não é possível excluir partida que contém aposta realizada',
      );
  }

  private async updateWinnerTeam(match: match) {
    const teamMatchWinner: matchsteams =
      await this.prisma.matchsteams.findFirst({
        where: { winner: 1, matchId: match.id },
      });

    const betsWinners: bet[] = await this.prisma.bet.findMany({
      where: { matchId: match.id, teamId: teamMatchWinner.teamId },
    });

    Promise.all(
      betsWinners.map(async (bet) => {
        await this.updateWinnerBet(match, teamMatchWinner, bet);
      }),
    );
  }

  private async updateWinnerBet(
    match: match,
    matchTeam: matchsteams,
    bet: bet,
  ): Promise<void> {
    bet.status = 'win';
    bet.lastUsername = match.lastUsername;
    await this.prisma.bet.update({
      data: bet,
      where: { id: bet.id },
    });
    await this.payWinnerBet(match, matchTeam, bet);
  }

  private async payWinnerBet(
    match: match,
    matchTeam: matchsteams,
    bet: bet,
  ): Promise<void> {
    const today = new Date();
    const amount = bet.amount.toNumber() * matchTeam.odds.toNumber();
    await this.prisma.transaction.create({
      data: {
        name: `Aposta #${bet.id} vencedora da partida #${match.id}`,
        amount: amount,
        dateTimeAt: today,
        status: 'done',
        receiver: bet.personId,
        payer: 1,
        betId: bet.id,
        lastUsername: bet.lastUsername,
      },
    });
  }
}
