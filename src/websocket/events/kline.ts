import { Candle } from 'binance-api-node';
import http from 'http';
import WebSocket from 'ws';
import container from '../../container';
import { BinanceService } from '../../services/binance.service';

export const getPairFromStream = (streamName: string): string => {
  return streamName.split('@')[0].replace('/', '');
}

export const getPeriodFromStream = (streamName: string): string => {
  return streamName.split('@')[1].replace('kline_', '');
}

export const klineEventHandler = (connection: WebSocket, request: http.IncomingMessage) => {
  const binanceService = container.resolve(BinanceService);

  const streamName = request?.url;
  if (!streamName) throw new Error(`Invalid stream name: ${streamName}`);

  const pair = getPairFromStream(streamName);
  const period = getPeriodFromStream(streamName);

  const candleCallback = (candle: Candle) => {
    connection.send(JSON.stringify(candle));
  };

  //@ts-ignore
  binanceService.getClient().ws.candles(pair, period, candleCallback, false);
};
