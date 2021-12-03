import { NewOrderSpot, Order } from 'binance-api-node';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { firstValueFrom } from 'rxjs';
import { Controller } from '../../controller';
import { OrderService } from '../../services/order.service';

export enum OrderResponseType {
  ACK = 'ACK',
  FULL = 'FULL',
  RESULT = 'RESULT',
}

@injectable()
export class OrderController implements Controller<'postOrder'> {

  constructor(
    @inject(OrderService) private readonly orderService: OrderService,
  ) {
  }

  determineResponseType(data: NewOrderSpot): OrderResponseType {
    let responseType: OrderResponseType;

    if (data.newOrderRespType) {
      responseType = data.newOrderRespType as OrderResponseType;
    } else {
      responseType = (['MARKET', 'LIMIT'].includes(data.type))
        ? OrderResponseType.FULL
        : OrderResponseType.ACK;
    }

    return responseType;
  }

  getACKResponse(data: Order) {
    return {
      symbol: data.symbol,
      orderId: data.orderId,
      orderListId: data.orderListId,
      clientOrderId: data.clientOrderId,
      ...(data.transactTime ? { transactTime: data.transactTime } : {}),
    };
  }

  getRESULTResponse(data: Order) {
    return {
      ...this.getACKResponse(data),
      price: data.price,
      origQty: data.origQty,
      executedQty: data.executedQty,
      cummulativeQuoteQty: data.cummulativeQuoteQty,
      status: data.status,
      timeInForce: data.timeInForce,
      type: data.type,
      side: data.side,
    };
  }

  getFULLResponse(data: Order) {
    return {
      ...this.getRESULTResponse(data),
      fills: data.fills ?? [],
    };
  }

  async postOrder(req: Request, res: Response) {
    const request: NewOrderSpot = { ...req.body, ...req.query };

    const clientOrderId = await this.orderService.addFromSpotOrder(request);
    const confirmedOrder = await firstValueFrom(this.orderService.getConfirmedOrder$(request, clientOrderId));

    const responseType: OrderResponseType = this.determineResponseType(request);
    if (responseType === OrderResponseType.ACK) {
      return res.json(this.getACKResponse(confirmedOrder));
    } else if (responseType === OrderResponseType.RESULT) {
      return res.json(this.getRESULTResponse(confirmedOrder));
    } else if (responseType === OrderResponseType.FULL) {
      return res.json(this.getFULLResponse(confirmedOrder));
    } else {
      throw new Error(`Unknown responseType: ${responseType}`);
    }
  }

}
