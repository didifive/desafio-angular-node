import { user } from '@prisma/client';

export const userMock: user = {
  id: 1,
  username: 'golaco@golaco.bet',
  password: '123456',
  role: 'ADMIN',
  personId: 1,
  lastUsername: 'golaco@golaco.bet',
};
