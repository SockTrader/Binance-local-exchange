import { Candle } from 'binance-api-node';
import { inject, injectable, multiInject } from 'inversify';
import { firstValueFrom } from 'rxjs';
import { OrderQuery } from '../store/order.query';
import { BinanceService } from './binance.service';
import { ExchangeInfoService } from './exchangeInfo.service';
import { BaseOrderMatcher } from './orderMatchers/baseOrderMatcher';

@injectable()
export class OrderMatchingService {

  constructor(
    @inject(BinanceService) private binanceService: BinanceService,
    @inject(OrderQuery) private orderQuery: OrderQuery,
    @inject(ExchangeInfoService) private exchangeInfoService: ExchangeInfoService,
    @multiInject(BaseOrderMatcher) private orderMatchers: BaseOrderMatcher[]
  ) {
  }

  async match(symbol: string, marketPrice: number) {
    const orders = await firstValueFrom(this.orderQuery.getOpenOrdersForSymbol$(symbol));
    if (orders.length <= 0) return;

    const _symbol = await this.exchangeInfoService.getSymbol(symbol);
    orders.forEach((order) => {
      this.orderMatchers.forEach(matcher => {
        if (matcher.shouldMatch(order)) {
          matcher.match(_symbol, order, marketPrice);
        }
      });
    });
  }

  async matchWithCandle(symbol: string, candle: Candle) {
    await this.match(symbol, parseFloat(candle.close));
  }

  async matchWithMarketPrice(symbol: string) {
    const result = await this.binanceService.getCurrentPrice(symbol);
    await this.match(symbol, result);
  }
}
