// import { interfaces, controller, httpGet, httpPost } from 'inversify-express-utils';
// import { inject } from '../ioc/ioc';
// import { UserService } from '../service/user';
// import { User } from '../models/user';
// import TYPES from '../constant/types';
// import * as line from '@line/bot-sdk';
// import { configLine } from '../config/line';
// import { LineUtils as lineUtils } from '../utils/line';

// @controller('/user')
// export class UserController implements interfaces.Controller  {

//   constructor(@inject(TYPES.UserService) private userService: UserService) {}

//   @httpGet('/api')
//   public getUsers(): Promise<User[]> {
//     return this.userService.getUsers();
//   }

//   @httpPost('/callback')
//   public callback(req, res) {
//     console.log(line.middleware(configLine));
//     console.log('configLine: ' + configLine);
//     console.log('req: ' + req);
//     console.log('res: ' + res);
//     // req.body.events should be an array of events
//     if (!Array.isArray(req.body.events)) {
//       return res.status(500).end();
//     }
//     // handle events separately
//     // Promise.all(req.body.events.map(lineUtils.instance.handleEvent))
//     Promise.all(req.body.events.map(lineUtils.instance.handleEvent))
//       .then(() => res.end())
//       .catch((err) => {
//         console.error(err);
//         res.status(500).end();
//       })
//     ;
//   }

// }
