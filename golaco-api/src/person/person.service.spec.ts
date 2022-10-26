import { DataViolationException } from './../exceptions';
import { userMock } from './../../test/utils/user.mock';
import { ResponsePersonDto } from './dtos/response-person.dto';
import { PageResponsePersonDto } from './dtos/page-response-person.dto';
import { PrismaService } from './../prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PersonService } from './person.service';
import {
  createPerson,
  peopleListMock,
  personMock,
  personMock2,
} from '../../test/utils/person.mock';
import { params } from '../../test/utils/page-params.mock';
import { UserService } from '../user/user.service';
import {
  transactionsMockList,
  transactionsMockList2,
} from '../../test/utils/transaction.mock';
import { ResponsePersonTransactionsDto } from './dtos/response-person-transactions.dto';
import { ResponsePersonBetsDto } from './dtos/response-person-bets.dto copy';
import { betsMockList } from '../../test/utils/bet.mock';

describe('PersonService', () => {
  let service: PersonService;
  let prisma: PrismaService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersonService, PrismaService, UserService],
    }).compile();

    service = module.get<PersonService>(PersonService);
    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('deve salvar nova pessoa', async () => {
      //arrange
      prisma.person.create = jest.fn().mockReturnValue(personMock2);
      prisma.address.create = jest.fn().mockReturnValue(personMock2.address[0]);
      userService.create = jest.fn();
      //act
      const person: ResponsePersonDto = await service.create(
        createPerson,
        userMock.username,
      );
      //assert
      expect(person.id).toBe(personMock2.id);
      expect(person.street).toBe(personMock2.address[0].street);
    });

    it('deve lançar DataViolationException quando prisma retornar algum erro de bando de dados', async () => {
      //arrange
      prisma.person.create = jest.fn(() => {
        throw new Error();
      });
      //assert
      await expect(
        service.create(createPerson, userMock.username),
      ).rejects.toThrow(DataViolationException);
    });

    it('Quando vai criar usuário para pessoa com email que já existe em outro usuário, mesmo assim o sistema deve criar usuário com novo email automaticamente editado', async () => {
      //arrange
      prisma.person.create = jest.fn().mockReturnValue(personMock2);
      prisma.address.create = jest.fn().mockReturnValue(personMock2.address[0]);
      userService.create = jest.fn().mockImplementationOnce(() => {
        throw new DataViolationException('Usuário existente');
      });
      //act
      const person: ResponsePersonDto = await service.create(
        createPerson,
        userMock.username,
      );
      //assert
      expect(person.id).toBe(personMock2.id);
      expect(person.street).toBe(personMock2.address[0].street);
      expect(userService.create).toHaveBeenCalledTimes(2);
    });

    it('Quando vai criar usuário para pessoa e um erro de criação de usuário inesperado é retornado deve lançar erro com a mensagem do erro', async () => {
      //arrange
      prisma.person.create = jest.fn().mockReturnValue(personMock2);
      prisma.address.create = jest.fn().mockReturnValue(personMock2.address[0]);
      userService.create = jest.fn().mockImplementationOnce(() => {
        throw new Error('Unexpected user creating error');
      });
      //assert
      await expect(
        service.create(createPerson, userMock.username),
      ).rejects.toThrow(
        'Ocorreu um problema ao tentar executar a operação: Ocorreu um problema ao tentar criar usuário automaticamente: Unexpected user creating error.',
      );
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de pessoas com paginação', async () => {
      //arrange
      prisma.person.findMany = jest.fn().mockReturnValue(peopleListMock);
      //act
      const response: PageResponsePersonDto = await service.findAll(params);
      //assert
      expect(response.data[0].id).toBe(1);
      expect(response.data[1].id).toBe(2);
      expect(response.data[1].street).toBe(
        'Rua 15 de Novembro, n. 5687, Jd Cidade',
      );
      expect(response.pageInfo.currentPageItems).toBe(2);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma pessoa por id', async () => {
      //arrange
      prisma.person.findUniqueOrThrow = jest.fn().mockReturnValue(personMock);
      //act
      const person: ResponsePersonDto = await service.findOne(1);
      //assert
      expect(person.id).toBe(1);
    });

    it('deve lançar EntityNotFoundException quando id é inválido ', async () => {
      const invalidId = 2;
      //arrange
      prisma.person.findUniqueOrThrow = jest.fn(() => {
        throw new Error();
      });
      //assert
      await expect(service.findOne(invalidId)).rejects.toThrowError(
        `Pessoa com id ${invalidId} não foi encontrado(a)`,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar pessoa', async () => {
      //arrange
      prisma.person.update = jest.fn().mockReturnValue(personMock2);
      //act
      const person: ResponsePersonDto = await service.update(
        2,
        createPerson,
        userMock.username,
      );
      //assert
      expect(person.id).toBe(2);
    });

    it('deve lançar EntityNotFoundException quando id é inválido ', async () => {
      const invalidId = 2;
      //arrange
      prisma.person.findUniqueOrThrow = jest.fn(() => {
        throw new Error();
      });
      //assert
      await expect(
        service.update(invalidId, createPerson, userMock.username),
      ).rejects.toThrowError(
        `Pessoa com id ${invalidId} não foi encontrado(a)`,
      );
    });

    it('deve lançar DataViolationException quando dado de pessoa é inválido', async () => {
      //arrange
      prisma.person.update = jest.fn(() => {
        throw new Error();
      });
      //assert
      await expect(
        service.update(2, createPerson, userMock.username),
      ).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('deve excluir pessoa por id', async () => {
      //arrange
      prisma.person.delete = jest.fn();
      prisma.person.update = jest.fn();
      //act
      await service.remove(1, userMock.username);
      //assert
      expect(prisma.person.delete).toHaveBeenCalled();
    });

    it('deve lançar EntityNotFoundException quando id é inválido ', async () => {
      const invalidId = 2;
      //arrange
      prisma.person.findUniqueOrThrow = jest.fn(() => {
        throw new Error();
      });
      //assert
      await expect(service.findOne(invalidId)).rejects.toThrowError(
        `Pessoa com id ${invalidId} não foi encontrado(a)`,
      );
    });

    it('Quando tentar excluir e o banco de dados retorna erro, deve lançar o erro', async () => {
      //arrange
      prisma.person.delete = jest.fn().mockImplementationOnce(() => {
        throw new Error('Unexpected database error');
      });
      //assert
      await expect(service.remove(1, userMock.username)).rejects.toThrow(
        'Ocorreu um problema ao tentar executar a operação: Unexpected database error.',
      );
    });
  });

  describe('findTransactionsByPerson', () => {
    it('deve retornar dados da pessoa e lista paginada de transações de entrada e saída', async () => {
      //arrange
      prisma.person.findUniqueOrThrow = jest.fn().mockReturnValue(personMock);
      prisma.transaction.findMany = jest
        .fn()
        .mockReturnValueOnce(transactionsMockList)
        .mockReturnValueOnce(transactionsMockList2);
      //act
      const response: ResponsePersonTransactionsDto =
        await service.findTransactionsByPerson(1, params);
      //assert
      expect(response.id).toBe(1);
      expect(response.incomingTransactions.data[0].id).toBe(1);
      expect(response.outgoingTransactions.data[0].id).toBe(2);
    });
  });

  describe('findBetsByPerson', () => {
    it('deve retornar dados da pessoa e lista paginada de apostas', async () => {
      //arrange
      prisma.person.findUniqueOrThrow = jest.fn().mockReturnValue(personMock);
      prisma.bet.findMany = jest.fn().mockReturnValueOnce(betsMockList);
      //act
      const response: ResponsePersonBetsDto = await service.findBetsByPerson(
        1,
        params,
      );
      //assert
      console.log(response.bets.data[0]);
      expect(response.id).toBe(1);
      expect(response.bets.data[0].id).toBe(1);
    });
  });
});
