import { Store, StoreConfig } from '@datorama/akita';
import { injectable } from 'inversify';

export interface UserDataState {
  isListening: boolean;
}

export function createInitialState(): UserDataState {
  return {
    isListening: false
  };
}

@injectable()
@StoreConfig({ name: 'userData' })
export class UserDataStore extends Store<UserDataState> {

  constructor() {
    super(createInitialState());
  }

}
