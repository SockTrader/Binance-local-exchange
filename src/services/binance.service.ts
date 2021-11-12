import Binance from 'binance-api-node';
import { injectable } from 'inversify';

@injectable()
export class BinanceService {

  private _client = Binance();

  getClient() {
    return this._client;
  }

}
