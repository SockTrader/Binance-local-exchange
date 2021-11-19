import { of } from 'rxjs';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';
import { btcSymbolMock } from './symbol.mock';

export const exchangeInfoQueryMock = {
  getSymbol$: jest.fn(() => of(btcSymbolMock)),
} as unknown as ExchangeInfoQuery
