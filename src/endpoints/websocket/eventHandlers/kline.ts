import { Candle } from 'binance-api-node';
import http from 'http';
import { inject, injectable } from 'inversify';
import WebSocket from 'ws';
import { BinanceService } from '../../../services/binance.service';
import { OrderMatchingService } from '../../../services/orderMatching.service';
import { WebsocketEventHandler } from '../websocketEventHandler';

@injectable()
export class KlineEventHandler implements WebsocketEventHandler {

  constructor(
    @inject(BinanceService) private readonly binanceService: BinanceService,
    @inject(OrderMatchingService) private readonly orderMatchingService: OrderMatchingService,
  ) {
  }

  shouldHandle(request: http.IncomingMessage): boolean {
    return !!request.url?.includes('@kline');
  }

  getPairFromStream(streamName: string): string {
    return streamName.split('@')[0].replace('/', '');
  }

  getPeriodFromStream(streamName: string): string {
    return streamName.split('@')[1].replace('kline_', '');
  }

  async onMessage(connection: WebSocket, request: http.IncomingMessage): Promise<void> {
    const streamName = request?.url;
    if (!streamName) throw new Error(`Invalid stream name: ${streamName}`);

    const pair = this.getPairFromStream(streamName);
    const period = this.getPeriodFromStream(streamName);

    const candleCallback = (candle: Candle) => {
      connection.send(JSON.stringify(candle));
      this.orderMatchingService.matchWithCandle(pair, candle);
    };

    this.binanceService.getWsCandles(pair, period, candleCallback, false);
  }

}
