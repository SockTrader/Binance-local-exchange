import { Candle } from "binance-api-node";

type CandleCallback = (candle: Candle) => void;

let candleCallback: CandleCallback | undefined;

export const prices = jest.fn(({ symbol }: { symbol: string }) => {
  const prices: Record<string, string> = {
    'BTCUSDT': '10000.00000000',
    'ETHUSDT': '2500.00000000',
  };

  return { [symbol]: prices[symbol] };
});

export const reset = jest.fn(() => {
  candleCallback = undefined;
});

export default jest.fn(() => ({
  _reset: reset,
  prices: prices,
  exchangeInfo: jest.fn(),
  ws: {
    _sendCandles: (candles: Candle[]) => {
      if (!candleCallback) throw new Error('Make sure that ws.candles is called before sending any mocked candles');
      candles.forEach(candle => {
        if (candleCallback) candleCallback(candle);
      });
    },
    candles: jest.fn((pair: string, period: string, cb: CandleCallback) => {
      candleCallback = cb;
    }),
  }
}));
