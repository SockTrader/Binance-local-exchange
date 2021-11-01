import { singleton } from '@ood/singleton';
import { NewOrderSpot, OrderFill, OrderType, Symbol } from 'binance-api-node';
import config from 'config';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { createFixedFormatter, FixedFormat, getBaseQuantity, getQuoteQuantity } from '../order.utils';
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

  private _createFills(order: NewOrderSpot, price: number, symbol: Symbol, amount: number = 1): OrderFill[] | undefined {
    const f = createFixedFormatter(symbol);
    const quantity = getBaseQuantity(order, price);
    const commission: number = order.type === OrderType.MARKET
      ? config.get('fees.taker')
      : config.get('fees.maker');

    let fills: OrderFill[] = [];

    for (let i = 0; i < amount; i++) {
      const individualTradeQty = quantity / amount;

      const fee = order.side === 'BUY'
        ? quantity * commission
        : quantity * (commission * price);

      fills.push({
        tradeId: this.getNewTradeId(),
        price: f(price, FixedFormat.BAP),
        qty: f(individualTradeQty, FixedFormat.BAP),
        commissionAsset: order.side === 'BUY' ? symbol.baseAsset : symbol.quoteAsset,
        commission: f(fee, order.side === 'BUY' ? FixedFormat.BCP : FixedFormat.QCP)
      });
    }

    return fills;
  }

  async addFromOrderSpot(order: NewOrderSpot, marketPrice?: number) {
    const symbol = await firstValueFrom(this.exchangeInfoQuery.getSymbol$(order.symbol));

    if (!symbol) {
      throw new Error(`Symbol '${order.symbol}' could not be found in ExchangeInfo cache. Make sure to call /api/v3/exchangeInfo before creating an Order.`);
    }

    if (order.type === 'MARKET' && !!marketPrice) {
      throw new Error('No price given for a market order');
    }

    const f = createFixedFormatter(symbol);

    const price = marketPrice ?? 0;
    const quantity = getBaseQuantity(order, price);
    const executedQuantity = order.type === 'MARKET' ? quantity : 0;
    const cumQuoteQuantity = order.type === 'MARKET' ? getQuoteQuantity(order, price) : 0;

    return this.orderStore.add({
      symbol: order.symbol,
      orderId: this.getNewOrderId(),
      orderListId: -1,
      clientOrderId: order.newClientOrderId ?? uuid(),
      transactTime: new Date().getTime(),
      price: f(order.type === 'MARKET' ? price : 0, FixedFormat.BAP),
      origQty: f(quantity, FixedFormat.BAP),
      executedQty: f(executedQuantity, FixedFormat.BAP),
      cummulativeQuoteQty: f(cumQuoteQuantity, FixedFormat.QAP),
      status: order.type === 'MARKET' ? 'FILLED' : 'NEW',
      timeInForce: order.timeInForce ?? 'GTC',
      type: order.type,
      side: order.side,
      fills: order.type === 'MARKET' ? this._createFills(order, price, symbol, 2) : [],
      updateTime: new Date().getTime(),
      time: new Date().getTime(),
      isWorking: true
    });
  }
}
