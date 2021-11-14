import { of } from 'rxjs';
import { ExchangeInfoQuery } from '../store/exchangeInfo.query';

export const exchangeInfoQueryMock = {
  getSymbol$: jest.fn(() => of({
    symbol: 'BTCUSDT',
    status: 'TRADING',
    baseAsset: 'BTC',
    baseAssetPrecision: 8,
    quoteAsset: 'USDT',
    quotePrecision: 8,
    quoteAssetPrecision: 8,
    baseCommissionPrecision: 8,
    quoteCommissionPrecision: 8,
    orderTypes: [
      'LIMIT',
      'LIMIT_MAKER',
      'MARKET',
      'STOP_LOSS_LIMIT',
      'TAKE_PROFIT_LIMIT'
    ],
    icebergAllowed: true,
    ocoAllowed: true,
    quoteOrderQtyMarketAllowed: true,
    isSpotTradingAllowed: true,
    isMarginTradingAllowed: true,
    filters: [
      {
        filterType: 'PRICE_FILTER',
        minPrice: '0.01000000',
        maxPrice: '1000000.00000000',
        tickSize: '0.01000000'
      },
      {
        filterType: 'PERCENT_PRICE',
        multiplierUp: '5',
        multiplierDown: '0.2',
        avgPriceMins: 5
      },
      {
        filterType: 'LOT_SIZE',
        minQty: '0.00001000',
        maxQty: '9000.00000000',
        stepSize: '0.00001000'
      },
      {
        filterType: 'MIN_NOTIONAL',
        minNotional: '10.00000000',
        applyToMarket: true,
        avgPriceMins: 5
      },
      {
        filterType: 'ICEBERG_PARTS',
        limit: 10
      },
      {
        filterType: 'MARKET_LOT_SIZE',
        minQty: '0.00000000',
        maxQty: '95.46320577',
        stepSize: '0.00000000'
      },
      {
        filterType: 'MAX_NUM_ORDERS',
        maxNumOrders: 200
      },
      {
        filterType: 'MAX_NUM_ALGO_ORDERS',
        maxNumAlgoOrders: 5
      }
    ],
    permissions: [
      'SPOT',
      'MARGIN'
    ]
  })),
} as unknown as ExchangeInfoQuery
