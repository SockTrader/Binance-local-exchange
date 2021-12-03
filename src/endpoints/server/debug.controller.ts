import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Controller } from '../../controller';
import { OrderQuery } from '../../store/order.query';
import { UserDataQuery } from '../../store/userData.query';

@injectable()
export class DebugController implements Controller<'getDebugInfo'> {

  constructor(
    @inject(OrderQuery) private readonly orderQuery: OrderQuery,
    @inject(UserDataQuery) private readonly userDataQuery: UserDataQuery
  ) {
  }

  async getDebugInfo(req: Request, res: Response) {
    return res
      .header('X-Local', 'true')
      .json({
        orders: this.orderQuery.getValue(),
        userData: this.userDataQuery.getValue()
      });
  }

}
