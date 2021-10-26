import { singleton } from '@ood/singleton';
import { NewOrderSpot } from 'binance-api-node';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { OrderStore } from '../store/order.store';

@singleton
export class OrderService {

  private _orderId: number = 0;

  private _tradeId: number = 0;

  constructor(
    private orderStore: OrderStore,
    private exchangeInfoQuery: ExchangeInfoQuery
  ) {
  }

  getNewOrderId(): number {
    this._orderId += 1;
    return this._orderId;
  }

  getNewTradeId(): number {
    this._tradeId += 1;
    return this._tradeId;
  }

  async addFromOrderSpot(order: NewOrderSpot) {
    const symbol = await firstValueFrom(this.exchangeInfoQuery.getSymbol$(order.symbol));

    if (!symbol) {
      throw new Error(`Symbol '${order.symbol}' could not be found in ExchangeInfo cache. Make sure to call /api/v3/exchangeInfo before creating an Order.`);
    }

    // @TODO use Symbol info to create Order

    return this.orderStore.add({
      symbol: order.symbol,
      orderId: this.getNewOrderId(),
      orderListId: -1,
      clientOrderId: order.newClientOrderId ?? uuid(),
      transactTime: new Date().getTime(),
      price: '0.00000000',
      origQty: '10.00000000',
      executedQty: '10.00000000',
      cummulativeQuoteQty: '10.00000000',
      status: order.type === 'MARKET' ? 'FILLED' : 'NEW',
      timeInForce: order.timeInForce ?? 'GTC',
      type: order.type,
      side: order.side,
      fills: [
        {
          tradeId: this.getNewTradeId(),
          price: '4000.00000000',
          qty: '1.00000000',
          commission: '4.00000000',
          commissionAsset: 'USDT'
        },
        {
          tradeId: this.getNewOrderId(),
          price: '3999.00000000',
          qty: '5.00000000',
          commission: '19.99500000',
          commissionAsset: 'USDT'
        }
      ],
      updateTime: new Date().getTime(),
      time: new Date().getTime(),
      isWorking: true
    });
  }
}
