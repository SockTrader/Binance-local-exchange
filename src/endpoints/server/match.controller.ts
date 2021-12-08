import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Controller } from '../../controller';
import { OrderMatchingService } from '../../services/orderMatching.service';

type MatchRequest = {
  symbol: string;
  price: number;
}

@injectable()
export class MatchController implements Controller<'postMatch'> {

  constructor(
    @inject(OrderMatchingService) private readonly orderMatchingService: OrderMatchingService,
  ) {
  }

  async postMatch(req: Request, res: Response) {
    const { symbol, price }: MatchRequest = { ...req.body, ...req.query };

    await this.orderMatchingService.matchWithPrice(symbol, price);

    return res
      .header('X-Local', 'true')
      .json({});
  }

}
