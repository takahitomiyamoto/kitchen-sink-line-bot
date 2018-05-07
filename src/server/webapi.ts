import * as express from 'express';
import * as circularJSON from 'circular-json';
import { configLine } from './config/line';
import { handleEvent } from './utils/line';

const line = require('@line/bot-sdk');
const app = express();

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

// webhook callback
app.post('/callback', line.middleware(configLine), (req, res) => {
  console.log('req: ' + circularJSON.stringify(req));
  console.log('res: ' + circularJSON.stringify(res));
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

export { app };
