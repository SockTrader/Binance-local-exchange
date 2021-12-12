import { NewOrderSpot, OrderType } from 'binance-api-node';
import { Request, Response } from 'express';
import { exchangeInfoQueryMock } from '../../../__mocks__/exchangeInfo.query.mock';
import container from '../../../container';
import { ExchangeInfoQuery } from '../../../store/exchangeInfo.query';
import { OrderController } from './order.controller';

describe('Order', () => {

  const buyOrder: NewOrderSpot = {
    type: <OrderType.MARKET>'MARKET',
    quantity: '1',
    symbol: 'BTCUSDT',
    newClientOrderId: '1',
    side: 'BUY',
  }

  let controller: OrderController;

  beforeEach(() => {
    container.snapshot();

    container.rebind(ExchangeInfoQuery).toConstantValue(exchangeInfoQueryMock);
    controller = container.resolve(OrderController);
  })

  afterEach(() => {
    container.restore();
    jest.clearAllMocks();
  })

  it('Should return an ACKNOWLEDGED response', async () => {
    const req = { body: { ...buyOrder, newOrderRespType: 'ACK' }, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await controller.postOrder(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: '1',
      orderId: 1,
      orderListId: -1,
      symbol: 'BTCUSDT',
    }));
  });

  it('Should return an RESULT response', async () => {
    const req = { body: { ...buyOrder, newOrderRespType: 'RESULT' }, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await controller.postOrder(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: '1',
      price: '10000.00000000',
      origQty: '1.00000000',
      cummulativeQuoteQty: '10000.00000000',
      executedQty: '1.00000000',
    }));
  });

  it('should return the FULL response for MARKET orders by default', async () => {
    const req = { body: buyOrder, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await controller.postOrder(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      clientOrderId: '1',

      fills: [
        {
          commission: '0.00100000',
          commissionAsset: 'BTC',
          price: '10000.00000000',
          qty: '1.00000000',
          tradeId: 1
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

    await controller.postOrder(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        clientOrderId: '1',
        cummulativeQuoteQty: '0.00000000',
        executedQty: '0.00000000',
        fills: [],
        orderId: 1,
        orderListId: -1,
        origQty: '1.00000000',
        price: '1000.00000000',
        side: 'BUY',
        status: 'NEW',
        symbol: 'BTCUSDT',
        timeInForce: 'GTC',
        type: 'LIMIT'
      }
    ));
  });

  it('Should throw if order response type does not exist', async () => {
    const req = { body: { ...buyOrder, newOrderRespType: 'DOES_NOT_EXIST' }, query: {} } as Request;
    const res = { json: jest.fn() } as unknown as Response<any, any>;

    await expect(controller.postOrder(req, res)).rejects.toThrowError('Unknown responseType: DOES_NOT_EXIST');
  });

});
