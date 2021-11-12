import { NewOrderSpot, OrderStatus, OrderType } from 'binance-api-node';
import { inject, injectable } from 'inversify';
import { filter, Observable } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { isLimitOrder } from '../order.utils';
import { OpenOrder } from '../store/order.interfaces';
import { OrderQuery } from '../store/order.query';
import { OrderStore } from '../store/order.store';
import { OrderMatchingService } from './orderMatching.service';

@injectable()
export class OrderService {

  private _orderId: number = 0;

  private orderQuery = new OrderQuery(this.orderStore);

  constructor(
    @inject(OrderStore) private orderStore: OrderStore,
    @inject(OrderMatchingService) private orderMatchingService: OrderMatchingService
  ) {

  }

  getNewOrderId(): number {
    this._orderId += 1;
    return this._orderId;
  }

  async addFromOrderSpot(order: NewOrderSpot) {
    const clientOrderId = order.newClientOrderId ?? uuid();

    this.orderStore.add(<OpenOrder>{
      symbol: order.symbol,
      orderId: this.getNewOrderId(),
      orderListId: -1,
      clientOrderId,
      transactTime: new Date().getTime(),
      timeInForce: order.timeInForce ?? 'GTC',
      type: order.type,
      side: order.side,
      updateTime: new Date().getTime(),
      time: new Date().getTime(),
      isWorking: true,
      status: 'NEW',
      ...(isLimitOrder(order) && { price: parseFloat(order.price) }),
      ...(('quoteOrderQty' in order) && { quoteOrderQty: parseFloat(order.quoteOrderQty) }),
      ...(('quantity' in order) && { quantity: parseFloat(order.quantity) }),
      //price: f(order.type === 'MARKET' ? price : 0, FixedFormat.BAP),
      //origQty: f(quantity, FixedFormat.BAP),
      //executedQty: f(executedQuantity, FixedFormat.BAP),
      //cummulativeQuoteQty: f(cumQuoteQuantity, FixedFormat.QAP),
      //status: order.type === 'MARKET' ? 'FILLED' : 'NEW',
      //fills: order.type === 'MARKET' ? this._createFills(order, price, symbol, 2) : [],
    });

    if (isLimitOrder(order)) await this.orderMatchingService.matchWithMarketPrice(order.symbol);

    return clientOrderId;
  }

  getConfirmedOrder$(order: NewOrderSpot, clientOrderId: string): Observable<OpenOrder | undefined> {
    return this.orderQuery.selectEntity(clientOrderId).pipe(
      filter((o): o is OpenOrder => {
        return o?.status === (
          (order.type === <OrderType.MARKET>'MARKET') ? <OrderStatus>'FILLED' : <OrderStatus>'NEW'
        );
      })
    );
  }
}
