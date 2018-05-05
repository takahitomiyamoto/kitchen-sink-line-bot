import { Container, inject } from 'inversify';
import { provide } from 'inversify-binding-decorators';
import { UserService } from '../service/user';
import TYPES from '../constant/types';

// set up container
let container = new Container();
// set up bindings
container.bind<UserService>(TYPES.UserService).to(UserService);

export { container, provide, inject };