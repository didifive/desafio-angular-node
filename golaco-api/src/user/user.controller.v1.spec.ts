import { Test, TestingModule } from '@nestjs/testing';
import { UserControllerV1 } from './user.controller.v1';
import { UserService } from './user.service';

describe('UserControllerV1', () => {
  let controller: UserControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserControllerV1],
      providers: [UserService],
    }).compile();

    controller = module.get<UserControllerV1>(UserControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
