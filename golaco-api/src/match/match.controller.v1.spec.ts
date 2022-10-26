import { Test, TestingModule } from '@nestjs/testing';
import { MatchControllerV1 } from './match.controller.v1';
import { MatchService } from './match.service';

describe('MatchController', () => {
  let controller: MatchControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchControllerV1],
      providers: [MatchService],
    }).compile();

    controller = module.get<MatchControllerV1>(MatchControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
