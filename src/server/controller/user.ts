import { interfaces, controller, httpGet } from 'inversify-express-utils';
import { inject } from '../ioc/ioc';
import { UserService } from '../service/user';
import { User } from '../models/user';
import TYPES from '../constant/types';

@controller('/user')
export class UserController implements interfaces.Controller  {

  constructor(@inject(TYPES.UserService) private userService: UserService) {}

  @httpGet('/')
  public getUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }
}
