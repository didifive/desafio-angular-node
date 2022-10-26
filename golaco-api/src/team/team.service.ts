import { Injectable } from '@nestjs/common';
import { team } from '@prisma/client';
import { PageInfoDto } from '../dto/page-info.dto';
import { DataViolationException, EntityNotFoundException } from '../exceptions';
import { PrismaService } from '../prisma.service';
import { PageResponseTeamDto } from './dto/page-response-team.dto';
import { RequestTeamDto } from './dto/request-team.dto';
import { ResponseTeamDto } from './dto/response-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    requestTeamDto: RequestTeamDto,
    currentUsername: string,
  ): Promise<ResponseTeamDto> {
    const team: team = this.toTeamModel(requestTeamDto, currentUsername);

    let createdTeam: team;
    try {
      createdTeam = await this.prisma.team.create({
        data: team,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    return this.toResponseTeamDto(createdTeam);
  }

  async findAll(params: Params): Promise<PageResponseTeamDto> {
    const { page, take, orderBy } = params;
    const countTeam: number = await this.prisma.team.count();
    const skip: number = page * take;
    const pageInfo: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countTeam / take) - 1,
      totalItems: countTeam,
    };
    const teamList = await this.prisma.team.findMany({
      skip,
      take,
      orderBy,
    });

    const responseTeamDtoList: ResponseTeamDto[] = [];
    teamList.forEach((team: team) =>
      responseTeamDtoList.push(this.toResponseTeamDto(team)),
    );

    return this.toPageResponseTeamDto(responseTeamDtoList, pageInfo);
  }

  async findOne(id: number): Promise<ResponseTeamDto> {
    const team = await this.getTeam(id);
    return this.toResponseTeamDto(team);
  }

  async update(
    id: number,
    updateTeamDto: RequestTeamDto,
    currentUsername: string,
  ): Promise<ResponseTeamDto> {
    const team = await this.getTeam(id);

    team.name = updateTeamDto.name;
    team.teamImage = updateTeamDto.teamImage;

    const updatedTeam = await this.updateTeam(team, currentUsername);

    return this.toResponseTeamDto(updatedTeam);
  }

  async remove(id: number, currentUsername: string): Promise<void> {
    const team = await this.getTeam(id);

    await this.updateTeam(team, currentUsername);

    try {
      await this.prisma.team.delete({
        where: { id: id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  private toTeamModel(
    requestTeamDto: RequestTeamDto,
    currentUsername: string,
  ): team {
    return {
      id: undefined,
      name: requestTeamDto.name,
      teamImage: requestTeamDto.teamImage,
      lastUsername: currentUsername,
    };
  }

  private toResponseTeamDto(team: team): ResponseTeamDto {
    if (team[0]) team = team[0];

    const responsePersonDto: ResponseTeamDto = {
      id: team.id,
      name: team.name,
      teamImage: team.teamImage,
    };

    return responsePersonDto;
  }

  private toPageResponseTeamDto(
    responseTeamDtoList: ResponseTeamDto[],
    page: PageInfoDto,
  ): PageResponseTeamDto {
    page.currentPageItems = responseTeamDtoList.length;
    if (page.lastPage === -1) page.lastPage = 0;
    const pageResponseTeamDto: PageResponseTeamDto = {
      pageInfo: page,
      data: responseTeamDtoList,
    };
    return pageResponseTeamDto;
  }

  private async getTeam(id: number): Promise<team> {
    try {
      return await this.prisma.team.findUniqueOrThrow({
        where: { id: id },
      });
    } catch (err: any) {
      throw new EntityNotFoundException('Time', id);
    }
  }

  private async updateTeam(team: team, currentUsername: string): Promise<team> {
    team.lastUsername = currentUsername;
    try {
      return await this.prisma.team.update({
        data: team,
        where: { id: team.id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }
}
