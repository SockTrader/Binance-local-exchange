import { inject, injectable } from 'inversify';
import { firstValueFrom } from 'rxjs';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';

@injectable()
export class ExchangeInfoService {

  constructor(
    @inject(ExchangeInfoQuery) private exchangeInfoQuery: ExchangeInfoQuery
  ) {
  }

  public async getSymbol(symbol: string) {
    const _symbol = await firstValueFrom(this.exchangeInfoQuery.getSymbol$(symbol));

    if (!_symbol) {
      throw new Error(`Symbol '${symbol}' could not be found in ExchangeInfo cache. Make sure to call /api/v3/exchangeInfo before creating an Order.`);
    }

    return _symbol;
  }
}
