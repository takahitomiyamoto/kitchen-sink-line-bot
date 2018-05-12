import * as express from 'express';
import * as circularJSON from 'circular-json';
import * as line from '@line/bot-sdk';
import { configLine } from './config/line';
import { handleEvent } from './controller/line';
import { JSONParseError, SignatureValidationFailed } from "@line/bot-sdk";

// TODO: export class WebApi
const app = express();

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));
app.use('/uploaded', express.static('uploaded'));

// webhook callback
app.post('/callback', line.middleware(configLine), (req, res) => {
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

app.use((err, req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).send(err.signature)
    return;
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw)
    return;
  }
  next(err) // will throw default 500
});

export { app };
