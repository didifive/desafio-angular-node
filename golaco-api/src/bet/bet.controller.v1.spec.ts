import { Test, TestingModule } from '@nestjs/testing';
import { BetControllerV1 } from './bet.controller.v1';
import { BetService } from './bet.service';

describe('BetControllerV1', () => {
  let controller: BetControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BetControllerV1],
      providers: [BetService],
    }).compile();

    controller = module.get<BetControllerV1>(BetControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
