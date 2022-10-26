import { Test, TestingModule } from '@nestjs/testing';
import { PersonControllerV1 } from './person.controller.v1';
import { PersonService } from './person.service';

describe('PersonController', () => {
  let controller: PersonControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonControllerV1],
      providers: [PersonService],
    }).compile();

    controller = module.get<PersonControllerV1>(PersonControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
