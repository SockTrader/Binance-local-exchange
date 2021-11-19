import Binance, { Candle } from 'binance-api-node';
import { injectable } from 'inversify';

@injectable()
export class BinanceService {

  private static PRICE_CACHE_TIME = 60;

  private _client = Binance();

  private _lastPrice: Record<string, { time: number, price: number }> = {};

  getWsCandles(pair: string, period: string, cb: (candle: Candle) => void, transform = true) {
    //@ts-ignore
    return this._client.ws.candles(pair, period, cb, transform);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const now = Math.round(new Date().getTime());

      if (!this._lastPrice[symbol] || (now - this._lastPrice[symbol].time) > BinanceService.PRICE_CACHE_TIME) {
        const prices = await this._client.prices({ symbol })

        this._lastPrice[symbol] = {
          time: now,
          price: parseFloat(prices[symbol])
        };
      }

      return this._lastPrice[symbol].price;
    } catch (e) {
      throw new Error(`Unable to determine price for symbol "${symbol}"`);
    }
  }

}
