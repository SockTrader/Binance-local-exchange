import { Request, Response } from 'express';
import container from '../../container';
import { OrderMatchingService } from '../../services/orderMatching.service';
import { MatchController } from './match.controller';

describe('MatchController', () => {

  let controller: MatchController;

  const res = { json: jest.fn(), header: jest.fn(() => res) } as unknown as Response<any, any>;
  const orderMatchingService = { matchWithPrice: jest.fn() };

  beforeEach(() => {
    container.snapshot();

    container.rebind(OrderMatchingService).toConstantValue(orderMatchingService as unknown as OrderMatchingService);
    controller = container.resolve(MatchController);
  })

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  })

  it('should match with given price in body', async () => {
    await controller.postMatch({ body: { symbol: 'BTCUSDT', price: 1000 } } as Request, res);

    expect(orderMatchingService.matchWithPrice).toHaveBeenCalledWith('BTCUSDT', 1000);
  });

});
