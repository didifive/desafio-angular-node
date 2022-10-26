import { transaction } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
export const transactionMock: transaction = {
  id: 1,
  name: 'Aposta',
  amount: new Decimal('30'),
  dateTimeAt: new Date('2022-09-12T10:51:44.000Z'),
  status: 'done',
  receiver: 1,
  payer: 2,
  betId: 1,
  lastUsername: 'System Instalation',
};

export const transactionMock2: transaction = {
  id: 2,
  name: 'Retirada',
  amount: new Decimal('20'),
  dateTimeAt: new Date('2022-09-12T10:51:44.000Z'),
  status: 'done',
  receiver: null,
  payer: 2,
  betId: null,
  lastUsername: 'System Instalation',
};

export const transactionsMockList: transaction[] = [transactionMock];

export const transactionsMockList2: transaction[] = [transactionMock2];
