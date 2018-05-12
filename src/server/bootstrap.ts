import { configHeroku } from './config/heroku';
import { app } from './webapi';

// TODO: WebApiのインスタンスをappに設定する
app.listen(configHeroku.port, () => {
  console.log(`listening on ${configHeroku.port}`);
});
