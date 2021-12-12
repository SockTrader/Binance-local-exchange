import { NewOrderLimit, NewOrderMarketBase, NewOrderMarketQuote, NewOrderSpot, Order, OrderStatus, OrderType, Symbol } from 'binance-api-node';
import { inject, injectable } from 'inversify';
import { filter, from, map, Observable, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { createFixedFormatter, FixedFormat, isLimitOrder, isMarketOrder, isMarketOrderBase, isMarketOrderQuote } from '../utils/order.utils';
import { InternalBaseOrder, InternalLimitOrder, InternalMarketOrder, InternalMarketQuoteOrder, InternalOrder } from '../store/order.interfaces';
import { OrderQuery } from '../store/order.query';
import { OrderStore } from '../store/order.store';
import { ExchangeInfoService } from './exchangeInfo.service';
import { OrderMatchingService } from './orderMatching.service';

@injectable()
export class OrderService {

  constructor(
    @inject(OrderStore) private orderStore: OrderStore,
    @inject(OrderQuery) private orderQuery: OrderQuery,
    @inject(OrderMatchingService) private orderMatchingService: OrderMatchingService,
    @inject(ExchangeInfoService) private exchangeInfoService: ExchangeInfoService,
  ) {
  }

  async addFromSpotOrder(order: NewOrderSpot) {
    let internalOrder: InternalOrder | undefined = undefined;

    if (isLimitOrder(order)) {
      internalOrder = this._getLimitOrder(order);
    } else if (isMarketOrderQuote(order)) {
      internalOrder = this._getMarketOrderQuote(order);
    } else if (isMarketOrderBase(order)) {
      internalOrder = this._getMarketOrderBase(order);
    }

    if (internalOrder == null) throw new Error(`Order type: "${order.type}" currently not supported`);
    this.orderStore.add(internalOrder);

    if (isMarketOrder(order)) await this.orderMatchingService.matchWithMarketPrice(order.symbol);

    return internalOrder.clientOrderId;
  }

  /**
   * Get all orders 'confirmed' orders that are newly stored in the Order store.
   * @param {NewOrderSpot} order
   * @param {string} clientOrderId
   * @returns {Observable<Order>}
   */
  getConfirmedOrder$(order: NewOrderSpot, clientOrderId: string): Observable<Order> {
    return this.orderQuery.selectEntity(clientOrderId).pipe(
      filter((o): o is InternalOrder => {
        return o?.status === (
          // Note: market orders are immediately filled.
          (order.type === <OrderType.MARKET>'MARKET') ? <OrderStatus>'FILLED' : <OrderStatus>'NEW'
        );
      }),
      switchMap(order => from(this.exchangeInfoService.getSymbol(order.symbol)).pipe(
        map<Symbol, [Symbol, InternalOrder]>(symbol => [symbol, order])
      )),
      map(([symbol, order]) => this._formatInternalOrder(order, symbol)),
    );
  }

  private _formatInternalOrder(order: InternalOrder, symbol: Symbol): Order {
    const f = createFixedFormatter(symbol);
    const o = order as any;
    return {
      ...order,
      price: f(o.price ?? 0, FixedFormat.BAP),
      origQty: f(o.origQty ?? 0, FixedFormat.BAP),
      executedQty: f(o.executedQty ?? 0, FixedFormat.BAP),
      cummulativeQuoteQty: f(o.cummulativeQuoteQty ?? 0, FixedFormat.QAP),
      icebergQty: f(order.icebergQty ?? 0, FixedFormat.BAP),
      stopPrice: f(order.stopPrice ?? 0, FixedFormat.BAP),
      fills: (order.fills ?? []).map(fill => ({
        ...fill,
        price: f(fill.price, FixedFormat.BAP),
        qty: f(fill.qty, FixedFormat.BAP),
        commission: f(fill.commission, order.side === 'BUY' ? FixedFormat.BCP : FixedFormat.QCP),
      }))
    };
  }

  private _getBaseOrder(order: NewOrderSpot): InternalBaseOrder {
    const clientOrderId = order.newClientOrderId ?? uuid();

    return {
      symbol: order.symbol,
      orderId: this.orderStore.createNewOrderId(),
      orderListId: -1,
      clientOrderId,
      timeInForce: order.timeInForce ?? 'GTC',
      type: order.type,
      side: order.side,
      updateTime: new Date().getTime(),
      time: new Date().getTime(),
      isWorking: true,
      status: 'NEW',
    }
  }

  private _getLimitOrder(order: NewOrderLimit): InternalLimitOrder {
    const price = parseFloat(order.price);
    const qty = parseFloat(order.quantity);

    return {
      ...this._getBaseOrder(order),
      origQty: qty,
      price
    };
  }

  private _getMarketOrderQuote(order: NewOrderMarketQuote): InternalMarketQuoteOrder {
    return {
      ...this._getBaseOrder(order),
      cummulativeQuoteQty: parseFloat(order.quoteOrderQty),
      transactTime: new Date().getTime(),
    };
  }

  private _getMarketOrderBase(order: NewOrderMarketBase): InternalMarketOrder {
    return {
      ...this._getBaseOrder(order),
      origQty: parseFloat(order.quantity),
      transactTime: new Date().getTime(),
    };
  }
}
