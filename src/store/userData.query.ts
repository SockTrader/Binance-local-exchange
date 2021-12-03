import { Query } from '@datorama/akita';
import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { UserDataState, UserDataStore } from './userData.store';

@injectable()
export class UserDataQuery extends Query<UserDataState> {

  constructor(
    @inject(UserDataStore) protected store: UserDataStore
  ) {
    super(store);
  }

  isListening$(): Observable<boolean> {
    return this.select(state => state.isListening);
  }

}
