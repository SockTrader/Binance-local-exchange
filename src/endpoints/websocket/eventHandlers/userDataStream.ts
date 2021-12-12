import { OrderType_LT, Symbol } from 'binance-api-node';
import http from 'http';
import { inject, injectable } from 'inversify';
import { combineLatest, filter, map, mergeMap, Observable, of, withLatestFrom } from 'rxjs';
import WebSocket from 'ws';
import { createFixedFormatter, FixedFormat } from '../../../utils/order.utils';
import { ExchangeInfoService } from '../../../services/exchangeInfo.service';
import { InternalFilledOrder } from '../../../store/order.interfaces';
import { OrderQuery } from '../../../store/order.query';
import { UserDataQuery } from '../../../store/userData.query';
import { WebsocketEventHandler } from '../websocketEventHandler';

@injectable()
export class UserDataStreamEventHandler implements WebsocketEventHandler {

  private connection?: WebSocket;

  private readonly filledOrderUpdates$ = this.orderQuery.getFilledOrderUpdates$().pipe(
    withLatestFrom(this.userDataQuery.isListening$()),
    filter(([order, isListening]) => !!isListening && order.type != <OrderType_LT>'MARKET'),
    map(([order]) => order),
  );

  private readonly orderUpdateWithSymbol$: Observable<[InternalFilledOrder, Symbol]> = this.filledOrderUpdates$.pipe(
    mergeMap((order) => combineLatest([
      of(order),
      this.exchangeInfoService.getSymbol(order.symbol)
    ]))
  );

  constructor(
    @inject(ExchangeInfoService) private readonly exchangeInfoService: ExchangeInfoService,
    @inject(UserDataQuery) private readonly userDataQuery: UserDataQuery,
    @inject(OrderQuery) private readonly orderQuery: OrderQuery,
  ) {
    this.orderUpdateWithSymbol$.subscribe(([order, symbol]) => {
      this.createExecutionReports(order, symbol).forEach((report) => {
        if (this.connection) {
          this.connection.send(JSON.stringify(report));
        }
      });
    });
  }

  public shouldHandle(request: http.IncomingMessage): boolean {
    return request?.url === '/userDataStream';
  }

  async onMessage(connection: WebSocket, request: http.IncomingMessage): Promise<void> {
    if (!this.connection) {
      this.connection = connection;
    }
  }

  private createExecutionReports(order: InternalFilledOrder, symbol: Symbol) {
    const f = createFixedFormatter(symbol);
    let cumQty = 0;
    let cumQuoteQty = 0;

    return order.fills?.map((fill) => {
      const quoteQty = fill.price * fill.qty;
      cumQuoteQty += quoteQty;
      cumQty += fill.qty;

      return {
        'e': 'executionReport',        // Event type
        'E': new Date().getTime(),     // Event time
        's': order.symbol,             // Symbol
        'c': order.clientOrderId,      // Client order ID
        'S': order.side,               // Side
        'o': order.type,               // Order type
        'f': order.timeInForce,        // Time in force
        'q': f(order.origQty, FixedFormat.BAP), // Order quantity
        'p': f(order.price, FixedFormat.BAP), // Order price
        'P': f(0, FixedFormat.BAP), // Stop price
        'F': f(0, FixedFormat.BAP), // Iceberg quantity
        'g': -1,                       // OrderListId
        'C': '',                       // Original client order ID; This is the ID of the order being canceled
        'x': 'TRADE',                  // Current execution type
        'X': order.status,             // Current order status
        'r': 'NONE',                   // Order reject reason; will be an error code.
        'i': order.orderId,            // Order ID
        'l': fill.qty,                 // Last executed quantity
        'z': f(cumQty, FixedFormat.BAP), // Cumulative filled quantity
        'L': fill.price,               // Last executed price
        'n': f(fill.commission, FixedFormat.QCP), // Commission amount
        'N': fill.commissionAsset,     // Commission asset
        'T': order.transactTime,       // Transaction time
        't': -1,                       // Trade ID
        'I': Math.round(Math.random() * 1000), // Ignore
        'w': true,                     // Is the order on the book?
        'm': false,                    // Is this trade the maker side?
        'M': false,                    // Ignore
        'O': order.time,               // Order creation time
        'Z': f(cumQuoteQty, FixedFormat.QAP), // Cumulative quote asset transacted quantity
        'Y': f(cumQty, FixedFormat.QAP), // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
        'Q': f(order.cummulativeQuoteQty, FixedFormat.QAP) // Quote Order Qty
      }
    }) ?? [];
  }
}
