import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Controller } from '../../controller';
import { UserDataStore } from '../../store/userData.store';

type Endpoints = 'postUserDataStream' | 'putUserDataStream' | 'deleteUserDataStream';

@injectable()
export class UserDataStreamController implements Controller<Endpoints> {

  constructor(
    @inject(UserDataStore) private userDataStore: UserDataStore,
  ) {
  }

  async postUserDataStream(req: Request, res: Response) {
    this.userDataStore.update({ isListening: true });

    res
      .header('X-Local', 'true')
      .json({ listenKey: 'userDataStream' });
  }

  async putUserDataStream(req: Request, res: Response) {
    res
      .header('X-Local', 'true')
      .json({});
  }

  async deleteUserDataStream(req: Request, res: Response) {
    this.userDataStore.update({ isListening: false });

    res
      .header('X-Local', 'true')
      .json({});
  }

}
