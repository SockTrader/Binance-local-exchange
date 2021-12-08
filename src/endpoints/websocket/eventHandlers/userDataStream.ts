import http from 'http';
import WebSocket from 'ws';
import { inject, injectable } from 'inversify';
import { filter, map, withLatestFrom } from 'rxjs';
import { OrderQuery } from '../../../store/order.query';
import { UserDataQuery } from '../../../store/userData.query';
import { WebsocketEventHandler } from '../websocketEventHandler';

@injectable()
export class UserDataStreamEventHandler implements WebsocketEventHandler {

  private connection?: WebSocket;

  private readonly filledOrders$ = this.orderQuery.getFilledOrders$().pipe(
    withLatestFrom(this.userDataQuery.isListening$()),
    filter(([orders, isListening]) => !!isListening && orders.length > 0),
    map(([orders]) => orders),
  );

  constructor(
    @inject(UserDataQuery) private readonly userDataQuery: UserDataQuery,
    @inject(OrderQuery) private readonly orderQuery: OrderQuery,
  ) {
    this.filledOrders$.subscribe((order) => {
      if (this.connection) {
        this.connection.send(JSON.stringify({
          type: 'test'
        }))
      }
    });
  }

  async onMessage(connection: WebSocket, request: http.IncomingMessage): Promise<void> {
    if (!this.connection) {
      this.connection = connection;
    }
  }

  shouldHandle(request: http.IncomingMessage): boolean {
    return request?.url === '/userDataStream';
  }

}
