import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Symbol } from 'binance-api-node';
import { injectable } from 'inversify';

export interface ExchangeInfoState extends EntityState<Symbol, number> {
}

@injectable()
@StoreConfig({ name: 'exchangeInfo', idKey: 'symbol' })
export class ExchangeInfoStore extends EntityStore<ExchangeInfoState> {
  constructor() {
    super();
  }
}
