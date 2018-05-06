require('dotenv').config()
import 'reflect-metadata';
// load all injectable entities. the @provide() annotation will then automatically register them.
import './ioc/loader';
import { InversifyExpressServer } from 'inversify-express-utils';
import { container } from './ioc/ioc';
import { config as configHeroku } from './config/heroku';
import { WebApi as webApi } from './webapi';

let server = new InversifyExpressServer(container);
server.setConfig((_app) => {
  _app = new webApi().express;
});

let app = server.build();
app.listen(configHeroku.port);
console.log('Server started on port:' + configHeroku.port);

exports = module.exports = app;
