export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET ?? 'default_cookie_secret',
  },
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
});
