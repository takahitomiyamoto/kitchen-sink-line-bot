const configHeroku = {
  baseURL: process.env.BASE_URL,
  production: true,
  port: process.env.PORT || 3000
};

export { configHeroku }
