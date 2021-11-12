import { QueryEntity } from '@datorama/akita';
import { Symbol } from 'binance-api-node';
import { inject, injectable } from 'inversify';
import { map, Observable } from 'rxjs';
import { ExchangeInfoState, ExchangeInfoStore } from './exchangeInfo.store';

@injectable()
export class ExchangeInfoQuery extends QueryEntity<ExchangeInfoState> {
  constructor(
    @inject(ExchangeInfoStore) protected store: ExchangeInfoStore
  ) {
    super(store);
  }

  getSymbol$(symbol: string): Observable<Symbol | undefined> {
    return this.selectAll({
      filterBy: ({ symbol: currentSymbol }) => currentSymbol.toUpperCase() === symbol.toUpperCase()
    }).pipe(
      map(v => v[0])
    );
  }
}
