import 'dotenv/config';
import { loadEnv } from './config/env';
import { buildApp } from './container';

const env = loadEnv();
const { app } = buildApp(env);

app.listen(env.PORT, () => {
  console.log(`Dealership API listening on http://localhost:${env.PORT}`);
});
