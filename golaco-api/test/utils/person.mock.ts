import { address, person } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { RequestPersonDto } from '../../src/person/dtos/request-person.dto';

export const createPerson: RequestPersonDto = {
  name: 'Maria Oliveira',
  personType: 'F',
  cpfCnpj: '22222222222',
  email: 'maria@dominio.com',
  phone: '16966667777',
  street: 'Rua 15 de Novembro, n. 5687, Jd Cidade',
  city: 'São Paulo',
  state: 'SP',
  postalCode: '01111000',
  country: 'Brasil',
};
export const personMock: person & { address: address[] } = {
  id: 1,
  name: 'GOLAÇO LTDA',
  personType: 'J',
  cpfCnpj: '11111111000111',
  email: 'golaco@golaco.bet',
  phone: '16999998741',
  balance: new Decimal('500'),
  balanceAt: new Date('2022-09-06'),
  lastUsername: 'System Installation',
  address: [],
};
export const personMock2: person & { address: address[] } = {
  id: 2,
  name: 'Maria Oliveira',
  personType: 'F',
  cpfCnpj: '22222222222',
  email: 'maria@dominio.com',
  phone: '16966667777',
  balance: new Decimal('500'),
  balanceAt: new Date(),
  lastUsername: 'System Transaction Id: 6',
  address: [
    {
      id: 1,
      street: 'Rua 15 de Novembro, n. 5687, Jd Cidade',
      city: 'São Paulo',
      stateFU: 'SP',
      postalCode: '01111000',
      country: 'Brasil',
      personId: 2,
      lastUsername: 'System Installation',
    },
  ],
};

export const peopleListMock = [personMock, personMock2];
