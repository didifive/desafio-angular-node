import { Test, TestingModule } from '@nestjs/testing';
import { TeamControllerV1 } from './team.controller.v1';
import { TeamService } from './team.service';

describe('TeamsController', () => {
  let controller: TeamControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamControllerV1],
      providers: [TeamService],
    }).compile();

    controller = module.get<TeamControllerV1>(TeamControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
