import http from 'http';
import { inject, injectable } from 'inversify';
import { combineLatest } from 'rxjs';
import WebSocket from 'ws';
import { OrderQuery } from '../../store/order.query';
import { UserDataQuery } from '../../store/userData.query';
import { WebsocketEventHandler } from '../websocketEventHandler';

@injectable()
export class UserDataStreamEventHandler implements WebsocketEventHandler {

  private connection?: WebSocket;

  private readonly isActiveStream$ = combineLatest([
    this.userDataQuery.select(state => state.isListening),
    this.orderQuery.select()
  ]);

  constructor(
    @inject(UserDataQuery) private readonly userDataQuery: UserDataQuery,
    @inject(OrderQuery) private readonly orderQuery: OrderQuery,
  ) {
    this.isActiveStream$.subscribe(() => {
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
