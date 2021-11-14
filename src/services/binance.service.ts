import Binance, { Candle } from 'binance-api-node';
import { injectable } from 'inversify';

@injectable()
export class BinanceService {

  private _client = Binance();

  private _lastPriceTime: number = 0;

  private _lastPrice : number = 0;

  getWsCandles(pair: string, period: string, cb: (candle: Candle) => void, transform = true) {
    //@ts-ignore
    return this._client.ws.candles(pair, period, cb, transform);
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const now = Math.round(new Date().getTime());
      if ((now - this._lastPriceTime) > 60) {
        const prices = await this._client.prices({ symbol })
        this._lastPrice = parseFloat(prices[symbol]);
      }

      return this._lastPrice;
    } catch (e) {
      throw new Error(`Unable to determine price for symbol "${symbol}"`);
    }
  }

}
