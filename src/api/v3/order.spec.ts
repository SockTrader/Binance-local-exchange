import { NewOrderSpot, OrderType } from 'binance-api-node';
import { Request, Response } from 'express';
import { exchangeInfoQueryMock } from '../../__mocks__/exchangeInfo.query.mock';
import container from '../../container';
import { ExchangeInfoQuery } from '../../store/exchangeInfo.query';
import { OrderHandler } from './order';

describe('Order', () => {

  const buyOrder: NewOrderSpot = {
    type: <OrderType.MARKET>'MARKET',
    quantity: '1',
    symbol: 'BTCUSDT',
    newClientOrderId: '1',
    side: 'BUY',
  }

  beforeEach(() => {
    container.snapshot();

    container.rebind(ExchangeInfoQuery).toConstantValue(exchangeInfoQueryMock);
  })

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  })

  it('Should return an ACKNOWLEDGED response', async () => {
    const req = { body: { ...buyOrder, newOrderRespType: 'ACK' }, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await OrderHandler(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: '1',
      orderId: 1,
      orderListId: -1,
      symbol: 'BTCUSDT',
    }));
  });

  it('should return the FULL response for MARKET orders by default', async () => {
    const req = { body: buyOrder, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await OrderHandler(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: '1',
      cummulativeQuoteQty: '10000.00000000',
      executedQty: '1.00000000',
      fills: [
        {
          commission: '0.00050000',
          commissionAsset: 'BTC',
          price: '10000.00000000',
          qty: '0.50000000',
          tradeId: 1
        }, {
          commission: '0.00050000',
          commissionAsset: 'BTC',
          price: '10000.00000000',
          qty: '0.50000000',
          tradeId: 2
        }
      ],
      orderId: 1,
      orderListId: -1,
      origQty: '1.00000000',
      price: '10000.00000000',
      side: 'BUY',
      status: 'FILLED',
      symbol: 'BTCUSDT',
      timeInForce: 'GTC',
      type: 'MARKET'
    }));
  });

  it('should return the FULL response for LIMIT orders by default', async () => {
    const req = { body: { ...buyOrder, type: 'LIMIT', price: '1000' }, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await OrderHandler(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        clientOrderId: '1',
        cummulativeQuoteQty: '0.00000000',
        executedQty: '0.00000000',
        fills: [],
        orderId: 1,
        orderListId: -1,
        origQty: '1.00000000',
        price: 1000,
        side: 'BUY',
        status: 'NEW',
        symbol: 'BTCUSDT',
        timeInForce: 'GTC',
        type: 'LIMIT'
      }
    ));
  });

});
