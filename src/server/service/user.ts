import { provide } from '../ioc/ioc';
import TYPES from '../constant/types';
import { User } from '../models/user';

@provide(TYPES.UserService)
export class UserService {

  constructor() {}

  public getUsers(): Promise<User[]> {
    return new Promise<User[]>((resolve, reject) => {
    });
  }
}