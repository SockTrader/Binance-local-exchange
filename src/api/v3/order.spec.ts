import { NewOrderSpot, OrderType } from 'binance-api-node';
import { Request, Response } from 'express';
import { OrderHandler } from './order';

describe('Order', () => {

  const buyOrder: NewOrderSpot = {
    type: <OrderType.MARKET>'MARKET',
    quantity: '1',
    symbol: 'BTCUSDT',
    newClientOrderId: '1',
    side: 'BUY',
  }

  it('Should return an ACKNOWLEDGED response', async () => {
    const req = { body: buyOrder, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await OrderHandler(req, res, jest.fn());

    debugger;
    expect(res.json).toHaveBeenCalledWith(true);
  });

});
