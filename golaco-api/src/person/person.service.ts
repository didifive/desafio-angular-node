import { RequestUserDto } from './../user/dto/request-user.dto';
import { PageResponseTransactionDto } from './dtos/page-response-transaction.dto';
import { RequestPersonModel } from './models/request-person.model';
import {
  DataViolationException,
  EntityNotFoundException,
} from './../exceptions';
import { PageInfoDto } from './../dto/page-info.dto';
import { PageResponsePersonDto } from './dtos/page-response-person.dto';
import { ResponsePersonDto } from './dtos/response-person.dto';
import { Injectable } from '@nestjs/common';
import { RequestPersonDto } from './dtos/request-person.dto';
import { PrismaService } from '../prisma.service';
import { address, bet, person, transaction } from '@prisma/client';
import { RequestAddressModel } from './models/request-address.model';
import { ResponsePersonTransactionsDto } from './dtos/response-person-transactions.dto';
import { ResponsePersonBetsDto } from './dtos/response-person-bets.dto copy';
import { PageResponseBetDto } from './dtos/page-response-bet.dto';
import { UserService } from '../user/user.service';

/**
 * A PersonService class witch to be used to manage a people resource collection
 */
@Injectable()
export class PersonService {
  /**
   * The constructor function for the PersonService class
   * @param prisma A instance of the PrismaService for database operations
   * @param userService A instance of the UserService class for user operations
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  /**
   * CRUD - Create - Create new person
   * @param requestPersonDto A RequestPersonDto object with person data to create and persist
   * @param currentUsername The username of the current logged user for audit
   * @returns Promise<ResponsePersonDto>
   */
  async create(
    requestPersonDto: RequestPersonDto,
    currentUsername: string,
  ): Promise<ResponsePersonDto> {
    const person: RequestPersonModel = this.toRequestPersonModel(
      requestPersonDto,
      currentUsername,
    );

    let createdPerson: person;
    try {
      createdPerson = await this.prisma.person.create({
        data: person,
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }

    const createdAddress = await this.createAddress(
      requestPersonDto,
      createdPerson.id,
      currentUsername,
    );

    await this.createUserToPerson(createdPerson, currentUsername);

    const createdPersonAddress = {
      id: createdPerson.id,
      name: createdPerson.name,
      personType: createdPerson.personType,
      cpfCnpj: createdPerson.cpfCnpj,
      email: createdPerson.email,
      phone: createdPerson.phone,
      balance: createdPerson.balance,
      balanceAt: createdPerson.balanceAt,
      lastUsername: createdPerson.lastUsername,
      address: [createdAddress],
    };

    return this.toResponsePersonDto(createdPersonAddress);
  }

  /**
   * CRUD - Read - Returns list od people with pagination
   * @param params Params to set number of people (take), page and order (orderBy)
   * @returns Promise<PageResponsePersonDto>
   */
  async findAll(params: Params): Promise<PageResponsePersonDto> {
    const { page, take, orderBy } = params;
    const countPeople: number = await this.prisma.person.count();
    const skip: number = page * take;
    const pageInfo: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countPeople / take) - 1,
      totalItems: countPeople,
    };
    const personList = await this.prisma.person.findMany({
      skip,
      take,
      orderBy,
      include: {
        address: true,
      },
    });

    const responsePersonDtoList: ResponsePersonDto[] = [];
    personList.forEach((person: person & { address: address[] }) =>
      responsePersonDtoList.push(this.toResponsePersonDto(person)),
    );

    return this.toPageResponsePersonDto(responsePersonDtoList, pageInfo);
  }

  /**
   * CRUD - Read - Returns person by Id
   * @param id Person id
   * @returns Promise<ResponsePersonDto>
   */
  async findOne(id: number): Promise<ResponsePersonDto> {
    const person = await this.getPersonWithAddress(id);
    return this.toResponsePersonDto(person);
  }

  /**
   * CRUD - Update - Update a person by Id
   * @param id Person Id to update
   * @param updatePersonDto A RequestPersonDto object with person data to update and persist
   * @param currentUsername The username of the current logged user for audit
   * @returns Promise<ResponsePersonDto>
   */
  async update(
    id: number,
    updatePersonDto: RequestPersonDto,
    currentUsername: string,
  ): Promise<ResponsePersonDto> {
    const person = await this.getPerson(id);

    person.name = updatePersonDto.name;
    person.personType = updatePersonDto.personType;
    person.cpfCnpj = updatePersonDto.cpfCnpj;
    person.email = updatePersonDto.email;
    person.phone = updatePersonDto.phone;

    const updatedPerson = await this.updatePerson(person, currentUsername);

    const updatedAddress = await this.updateAddress(
      updatePersonDto,
      person.id,
      currentUsername,
    );

    const updatedPersonAddress = {
      id: updatedPerson.id,
      name: updatedPerson.name,
      personType: updatedPerson.personType,
      cpfCnpj: updatedPerson.cpfCnpj,
      email: updatedPerson.email,
      phone: updatedPerson.phone,
      balance: updatedPerson.balance,
      balanceAt: updatedPerson.balanceAt,
      lastUsername: updatedPerson.lastUsername,
      address: [updatedAddress],
    };

    return this.toResponsePersonDto(updatedPersonAddress);
  }

  /**
   * CRUD - Delete - Delete a person by Id
   * @param id Person Id to delete
   * @param currentUsername The username of the current logged user for audit
   */
  async remove(id: number, currentUsername: string): Promise<void> {
    const person = await this.getPerson(id);

    await this.updatePerson(person, currentUsername);

    try {
      await this.prisma.person.delete({
        where: { id: id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  /**
   * Get a list of incoming and other list of outgoing transactions by person id.
   * @param id Person Id
   * @param params Params to set number of transactions (take), page and order (orderBy)
   * @returns Promise<ResponsePersonTransactionsDto>
   */
  async findTransactionsByPerson(
    id: number,
    params: Params,
  ): Promise<ResponsePersonTransactionsDto> {
    const { page, take, orderBy } = params;
    const skip: number = page * take;

    const countTransactionsIncoming: number =
      await this.prisma.transaction.count({
        where: { receiver: id },
      });
    const pageInfoIncoming: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countTransactionsIncoming / take) - 1,
      totalItems: countTransactionsIncoming,
    };

    const countTransactionsOutgoing: number =
      await this.prisma.transaction.count({
        where: { payer: id },
      });
    const pageInfoOutgoing: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countTransactionsOutgoing / take) - 1,
      totalItems: countTransactionsOutgoing,
    };

    const person = await this.getPersonWithAddress(id);

    const incomingTransactions: transaction[] =
      await this.prisma.transaction.findMany({
        skip,
        take,
        orderBy,
        where: { receiver: id },
      });

    const outgoingTransactions: transaction[] =
      await this.prisma.transaction.findMany({
        skip,
        take,
        orderBy,
        where: { payer: id },
      });

    return this.toResponsePersonTransactionsDto(
      person,
      incomingTransactions,
      outgoingTransactions,
      pageInfoIncoming,
      pageInfoOutgoing,
    );
  }

  /**
   * Get a list of bets by person id.
   * @param id Person Id
   * @param params Params to set number of bets (take), page and order (orderBy)
   * @returns Promise<ResponsePersonBetsDto>
   */
  async findBetsByPerson(
    id: number,
    params: Params,
  ): Promise<ResponsePersonBetsDto> {
    const { page, take, orderBy } = params;
    const countBets: number = await this.prisma.bet.count({
      where: { personId: id },
    });
    const skip: number = page * take;
    const pageInfo: PageInfoDto = {
      itemsPerPage: take,
      currentPage: page,
      currentPageItems: take,
      lastPage: Math.ceil(countBets / take) - 1,
      totalItems: countBets,
    };

    const person = await this.getPersonWithAddress(id);

    const bets: bet[] = await this.prisma.bet.findMany({
      skip,
      take,
      orderBy,
      where: { personId: id },
    });

    return this.toResponsePersonBetsDto(person, bets, pageInfo);
  }

  /**
   * Join a list of ResponsePersonDto and a PageInfoDto into PageResponsePersonDto
   * @param responsePersonDtoList List of ResponsePersonDto
   * @param page Page info
   * @returns PageResponsePersonDto
   */
  private toPageResponsePersonDto(
    responsePersonDtoList: ResponsePersonDto[],
    page: PageInfoDto,
  ): PageResponsePersonDto {
    page.currentPageItems = responsePersonDtoList.length;
    if (page.lastPage === -1) page.lastPage = 0;
    const pageResponsePersonDto: PageResponsePersonDto = {
      pageInfo: page,
      data: responsePersonDtoList,
    };
    return pageResponsePersonDto;
  }

  /**
   * Transforms a person with address into a ResponsePersonDto object
   * @param person Person object with address
   * @returns ResponsePersonDto
   */
  private toResponsePersonDto(
    person: person & { address: address[] },
  ): ResponsePersonDto {
    if (person[0]) person = person[0];

    let balanceAtString: string;
    if (person.balanceAt) {
      balanceAtString = person.balanceAt.toISOString();
    } else {
      balanceAtString = null;
    }
    const responsePersonDto: ResponsePersonDto = {
      id: person.id,
      balance: Number(person.balance),
      balanceAt: balanceAtString,
      name: person.name,
      personType: person.personType,
      cpfCnpj: person.cpfCnpj,
      email: person.email,
      phone: person.phone,
    };

    if (
      typeof person.address !== undefined &&
      person.address[0] !== undefined
    ) {
      responsePersonDto.street = person.address[0].street;
      responsePersonDto.city = person.address[0].city;
      responsePersonDto.state = person.address[0].stateFU;
      responsePersonDto.postalCode = person.address[0].postalCode;
      responsePersonDto.country = person.address[0].country;
    }
    return responsePersonDto;
  }

  /**
   * Transforms the RequestPersonDto into a RequestPersonModel object with person information
   * @param requestPersonDto A RequestPersonDto object with person data
   * @param username The logged user for audit
   * @returns RequestPersonModel
   */
  private toRequestPersonModel(
    requestPersonDto: RequestPersonDto,
    username: string,
  ): RequestPersonModel {
    const today = new Date();
    return {
      name: requestPersonDto.name,
      personType: requestPersonDto.personType,
      cpfCnpj: requestPersonDto.cpfCnpj,
      email: requestPersonDto.email,
      phone: requestPersonDto.phone,
      balance: 0,
      balanceAt: today.toISOString(),
      lastUsername: username,
    };
  }

  /**
   * Extract the RequestPersonDto for a RequestAddressModel object with address information
   * @param requestPersonDto A RequestPersonDto object with person data
   * @param personId Person identifier
   * @param currentUsername The username of the current logged user for audit
   * @returns RequestAddressModel
   */
  private toRequestAddressModel(
    requestPersonDto: RequestPersonDto,
    personId: number,
    currentUsername: string,
  ): RequestAddressModel {
    return {
      street: requestPersonDto.street,
      city: requestPersonDto.city,
      stateFU: requestPersonDto.state,
      postalCode: requestPersonDto.postalCode,
      country: requestPersonDto.country,
      personId: personId,
      lastUsername: currentUsername,
    };
  }

  /**
   * Get a person object from the database and return the person object
   * @param id Person identifier
   * @returns Promise<person>
   */
  private async getPerson(id: number): Promise<person> {
    try {
      return await this.prisma.person.findUniqueOrThrow({
        where: { id: id },
      });
    } catch (err: any) {
      throw new EntityNotFoundException('Pessoa', id);
    }
  }

  /**
   * Get a person object from the database and return the person with respective address object
   * @param id Person identifier
   * @returns Promise<person & { address: address[] }>
   */
  private async getPersonWithAddress(
    id: number,
  ): Promise<person & { address: address[] }> {
    try {
      return await this.prisma.person.findUniqueOrThrow({
        include: {
          address: true,
        },
        where: { id: id },
      });
    } catch (err: any) {
      throw new EntityNotFoundException('Pessoa', id);
    }
  }

  /**
   * Update person in database with current person data and currentUsername for lastUsername used by audit
   * @param person A person object with person data to update in database
   * @param currentUsername The username of the current logged user for audit
   * @returns Promise<person>
   */
  private async updatePerson(
    person: person,
    currentUsername: string,
  ): Promise<person> {
    person.lastUsername = currentUsername;
    try {
      return await this.prisma.person.update({
        data: person,
        where: { id: person.id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  /**
   * Extract address data of the RequestPersonDto and save a new address in database
   * @param requestPersonDto A RequestPersonDto object with person and address data
   * @param personId Person identifier
   * @param currentUsername The username of the current logged user for audit
   * @returns Promise<address>
   */
  private async createAddress(
    requestPersonDto: RequestPersonDto,
    personId: number,
    currentUsername: string,
  ): Promise<address> {
    if (
      requestPersonDto.street ||
      requestPersonDto.city ||
      requestPersonDto.state ||
      requestPersonDto.postalCode ||
      requestPersonDto.country
    ) {
      const address: RequestAddressModel = this.toRequestAddressModel(
        requestPersonDto,
        personId,
        currentUsername,
      );
      return this.prisma.address.create({
        data: address,
      });
    }
  }

  /**
   * Extract address data of the RequestPersonDto and update a existing address in database
   * @param requestPersonDto A RequestPersonDto object with person and address data
   * @param personId Person identifier
   * @param username The logged user for audit
   * @returns Promise<address>
   */
  private async updateAddress(
    requestPersonDto: RequestPersonDto,
    personId: number,
    username: string,
  ): Promise<address> {
    const address = await this.prisma.address.findFirst({
      where: { personId: personId },
    });
    if (address === undefined || address === null)
      return this.createAddress(requestPersonDto, personId, username);

    const updateAddress = this.toRequestAddressModel(
      requestPersonDto,
      personId,
      username,
    );
    try {
      return await this.prisma.address.update({
        data: updateAddress,
        where: { id: address.id },
      });
    } catch (err: any) {
      throw new DataViolationException(err.message);
    }
  }

  /**
   * Transforms the list of incoming and outgoing transactions made by a person into a ResponsePersonTransactionsDto object
   * @param person A person object with person data
   * @param incomingTransactions A list of transaction object list of incoming transactions of the person
   * @param outgoingTransactions A list of transaction object list of outgoing transactions of the person
   * @param pageIncoming PageInfoDto to page list the incoming transactions
   * @param pageOutgoing PageInfoDto to page list the outgoing transactions
   * @returns ResponsePersonTransactionsDto
   */
  private toResponsePersonTransactionsDto(
    person: person & { address: address[] },
    incomingTransactions: transaction[],
    outgoingTransactions: transaction[],
    pageIncoming: PageInfoDto,
    pageOutgoing: PageInfoDto,
  ): ResponsePersonTransactionsDto {
    const personTransactions: ResponsePersonTransactionsDto =
      this.toResponsePersonDto(person);
    personTransactions.incomingTransactions = this.toPageResponseTransactionDto(
      incomingTransactions,
      pageIncoming,
    );
    personTransactions.outgoingTransactions = this.toPageResponseTransactionDto(
      outgoingTransactions,
      pageOutgoing,
    );

    return personTransactions;
  }

  /**
   * Transforms the list of bets made by person into a ResponsePersonBetsDto object
   * @param person A person object with person data
   * @param bets A list of bet object made by the person
   * @param page PageInfoDto to page list the bets
   * @returns ResponsePersonBetsDto
   */
  private toResponsePersonBetsDto(
    person: person & { address: address[] },
    bets: bet[],
    page: PageInfoDto,
  ): ResponsePersonBetsDto {
    const personBets: ResponsePersonBetsDto = this.toResponsePersonDto(person);
    personBets.bets = this.toPageResponseBetDto(bets, page);

    return personBets;
  }

  /**
   * Join a list of transactions and a PageInfoDto into PageResponseTransactionDto
   * @param transactions List of transactions
   * @param page Page info
   * @returns PageResponseTransactionDto
   */
  private toPageResponseTransactionDto(
    transactions: transaction[],
    page: PageInfoDto,
  ): PageResponseTransactionDto {
    page.currentPageItems = transactions.length;
    if (page.lastPage === -1) page.lastPage = 0;
    const pageResponseTransactionDto: PageResponseTransactionDto = {
      pageInfo: page,
      data: transactions,
    };
    return pageResponseTransactionDto;
  }

  /**
   * Join a list of bets and a PageInfoDto into PageResponseBetDto
   * @param bets List of bets
   * @param page Page info
   * @returns PageResponseBetDto
   */
  private toPageResponseBetDto(
    bets: bet[],
    page: PageInfoDto,
  ): PageResponseBetDto {
    page.currentPageItems = bets.length;
    if (page.lastPage === -1) page.lastPage = 0;
    const pageResponseBetDto: PageResponseBetDto = {
      pageInfo: page,
      data: bets,
    };
    return pageResponseBetDto;
  }

  /**
   * Automatically create a user account for the specified person.
   * If a error is encountered during creation of the account,
   * then the username will be updated and this function will called
   * recursively to create a new account for the specified person.
   * @param person A person object with person data
   * @param currentUsername The username of the current logged user for audit
   */
  private async createUserToPerson(person: person, currentUsername: string) {
    const requestUser: RequestUserDto = {
      username: person.email,
      password: person.cpfCnpj,
      role: 'USER',
      personId: person.id,
    };
    try {
      await this.userService.create(requestUser, currentUsername);
    } catch (error: any) {
      if (error instanceof DataViolationException) {
        const splittedUser = requestUser.username.split('@');
        splittedUser[0] += '1';
        requestUser.username = splittedUser.join('@');
        await this.createUserToPerson(person, currentUsername);
      } else {
        throw new DataViolationException(
          'Ocorreu um problema ao tentar criar usuário automaticamente: ' +
            error.message,
        );
      }
    }
  }
}
