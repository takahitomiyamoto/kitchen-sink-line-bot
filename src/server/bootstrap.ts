require('dotenv').config()
import { configHeroku } from './config/heroku';
import { app } from './webapi';

// listen on port
app.listen(configHeroku.port, () => {
  console.log(`listening on ${configHeroku.port}`);
});
