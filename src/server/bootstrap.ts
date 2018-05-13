import { configHeroku } from './config/heroku';
import { WebApi as webApi } from './webapi';

const app = webApi.instance.express;
app.listen(configHeroku.port, () => {
  console.log(`listening on ${configHeroku.port}`);
});
