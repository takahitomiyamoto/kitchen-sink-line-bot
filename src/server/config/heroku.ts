const configHeroku = {
  baseURL: process.env.HEROKU_BASE_URL,
  production: true,
  port: process.env.HEROKU_PORT || 3000
};

export { configHeroku }
