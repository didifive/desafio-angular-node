import { Test, TestingModule } from '@nestjs/testing';
import { TransactionControllerV1 } from './transaction.controller.v1';
import { TransactionService } from './transaction.service';

describe('TransactionControllerV1', () => {
  let controller: TransactionControllerV1;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionControllerV1],
      providers: [TransactionService],
    }).compile();

    controller = module.get<TransactionControllerV1>(TransactionControllerV1);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
