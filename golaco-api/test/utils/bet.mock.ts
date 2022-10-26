import { bet } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
export const betMock: bet = {
  id: 1,
  dateTimeAt: new Date('2022-09-12T10:51:44.000Z'),
  amount: new Decimal('20'),
  status: 'done',
  personId: 2,
  matchId: 1,
  teamId: 2,
  lastUsername: 'System Test',
};

export const betsMockList: bet[] = [betMock];
