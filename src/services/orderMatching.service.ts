import { Order, OrderFill, OrderType, Symbol } from 'binance-api-node';
import config from 'config';
import { inject, injectable } from 'inversify';
import { firstValueFrom } from 'rxjs';
import { createFixedFormatter, FixedFormat, getBaseQuantity, getQuoteQuantity } from '../order.utils';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { OpenOrder } from '../store/order.interfaces';
import { OrderQuery } from '../store/order.query';
import { OrderStore } from '../store/order.store';
import { BinanceService } from './binance.service';

@injectable()
export class OrderMatchingService {

  private _tradeId: number = 0;

  //private _lastPrice: Record<string, number> = {};

  constructor(
    @inject(BinanceService) private binanceService: BinanceService,
    @inject(OrderQuery) private orderQuery: OrderQuery,
    @inject(OrderStore) private orderStore: OrderStore,
    @inject(ExchangeInfoQuery) private exchangeInfoQuery: ExchangeInfoQuery
  ) {
  }

  getNewTradeId(): number {
    this._tradeId += 1;
    return this._tradeId;
  }

  private _createFills(order: Order | OpenOrder, price: number, symbol: Symbol, amount: number = 1): OrderFill[] | undefined {
    const f = createFixedFormatter(symbol);
    const quantity = getBaseQuantity(order, price);
    const commission: number = order.type === <OrderType.MARKET>'MARKET'
      ? config.get('fees.taker')
      : config.get('fees.maker');

    let fills: OrderFill[] = [];

    for (let i = 0; i < amount; i++) {
      const individualTradeQty = quantity / amount;

      const fee = order.side === 'BUY'
        ? individualTradeQty * commission
        : individualTradeQty * (commission * price);

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

  private _matchMarketOrder(symbol: Symbol, order: Order | OpenOrder, marketPrice: number) {
    const f = createFixedFormatter(symbol);

    const price = marketPrice ?? 0;
    const quantity = getBaseQuantity(order, price);
    const executedQuantity = order.type === 'MARKET' ? quantity : 0;
    const cumQuoteQuantity = order.type === 'MARKET' ? getQuoteQuantity(order, price) : 0;

    this.orderStore.update(order.clientOrderId, {
      price: f(order.type === 'MARKET' ? price : 0, FixedFormat.BAP),
      origQty: f(quantity, FixedFormat.BAP),
      executedQty: f(executedQuantity, FixedFormat.BAP),
      cummulativeQuoteQty: f(cumQuoteQuantity, FixedFormat.QAP),
      status: 'FILLED',
      fills: order.type === 'MARKET' ? this._createFills(order, price, symbol, 2) : [],
    });
  }

  // @TODO not finished yet
  private _matchLimitOrder(symbol: Symbol, order: Order | OpenOrder, marketPrice: number) {
    const f = createFixedFormatter(symbol);

    const price = marketPrice ?? 0;
    const quantity = getBaseQuantity(order, price);
    const executedQuantity = order.type === 'MARKET' ? quantity : 0;
    const cumQuoteQuantity = order.type === 'MARKET' ? getQuoteQuantity(order, price) : 0;

    this.orderStore.update(order.clientOrderId, {
      price: f(order.type === 'MARKET' ? price : 0, FixedFormat.BAP),
      origQty: f(quantity, FixedFormat.BAP),
      executedQty: f(executedQuantity, FixedFormat.BAP),
      cummulativeQuoteQty: f(cumQuoteQuantity, FixedFormat.QAP),
      status: 'FILLED',
      fills: order.type === 'MARKET' ? this._createFills(order, price, symbol, 2) : [],
    });
  }

  private async _getSymbolFromCache(symbol: string) {
    const _symbol = await firstValueFrom(this.exchangeInfoQuery.getSymbol$(symbol));

    if (!_symbol) {
      throw new Error(`Symbol '${symbol}' could not be found in ExchangeInfo cache. Make sure to call /api/v3/exchangeInfo before creating an Order.`);
    }

    return _symbol;
  }

  async match(symbol: string, marketPrice: number) {
    const _symbol = await this._getSymbolFromCache(symbol);
    const orders = await firstValueFrom(this.orderQuery.getOpenOrdersForSymbol$(symbol));

    orders.forEach((order) => {
      if (order.type === 'MARKET') {
        this._matchMarketOrder(_symbol, order, marketPrice);
      } else if (order.type === 'LIMIT') {
        this._matchLimitOrder(_symbol, order, marketPrice);
      } else {
        throw new Error(`Order type: "${order.type}" currently not supported by OrderMatching service`)
      }
    });
  }

  async matchWithMarketPrice(symbol: string) {
    const result = await this.binanceService.getClient().prices({ symbol });

    if (!result[symbol]) {
      throw new Error(`Unable to determine price for symbol "${symbol}"`);
    }

    await this.match(symbol, parseFloat(result[symbol]));
  }
}
