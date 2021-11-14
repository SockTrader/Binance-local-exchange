import { Candle } from "binance-api-node";

type CandleCallback = (candle: Candle) => void;

let candleCallback: CandleCallback | undefined;

export default jest.fn(() => ({
  _reset: () => {
    candleCallback = undefined;
  },
  prices: ({ symbol }: { symbol: string }) => {
    const prices: Record<string, string> = {
      'BTCUSDT': '10000.00000000',
      'ETHUSDT': '2500.00000000',
    };

    return { [symbol]: prices[symbol] };
  },
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
