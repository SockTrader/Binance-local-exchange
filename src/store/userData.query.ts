import { Query } from '@datorama/akita';
import { inject, injectable } from 'inversify';
import { UserDataState, UserDataStore } from './userData.store';

@injectable()
export class UserDataQuery extends Query<UserDataState> {

  constructor(
    @inject(UserDataStore) protected store: UserDataStore
  ) {
    super(store);
  }

}
