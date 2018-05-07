require('dotenv').config()
import 'reflect-metadata';
// load all injectable entities. the @provide() annotation will then automatically register them.
import './ioc/loader';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './ioc/ioc';
import { configHeroku } from './config/heroku';
import { WebApi as webApi } from './webapi';

let server = new InversifyExpressServer(container);
server.setConfig((_app) => {
  _app = new webApi().express;
});
server.setErrorConfig((_app) => {
  _app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
});
let app = server.build();
app.listen(configHeroku.port);
console.log('Server started on port:' + configHeroku.port);

exports = module.exports = app;
