import * as Express from 'express';
import * as BodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as line from '@line/bot-sdk';
import { configLine } from './config/line';
import { LineUtils as lineUtils } from './utils/line';

export class WebApi {
  protected _express: Express.Express;

  /**
   * @memberof WebApi
   */
  constructor() {
    this._express = Express()
      .use(BodyParser.json())
      .use(BodyParser.urlencoded({ extended: true }))
      .use(helmet())
      .use(cors())
      // serve static and downloaded files
      .use('/static', Express.static('static'))
      .use('/downloaded', Express.static('downloaded'))
      // webhook callback
      .post('/callback', line.middleware(configLine), (req: Express.Request, res: Express.Response) => {
        // req.body.events should be an array of events
        if (!Array.isArray(req.body.events)) {
          return res.status(500).end();
        }
        // handle events separately
        // Promise.all(req.body.events.map(lineUtils.instance.handleEvent))
        Promise.all(req.body.events.map(lineUtils.instance.handleEvent))
          .then(() => res.end())
          .catch((err) => {
            console.error(err);
            res.status(500).end();
          })
        ;
      })
    ;
  }

  /**
   * @readonly
   * @memberof WebApi
   */
  public get express() {
    return this._express;
  }
}