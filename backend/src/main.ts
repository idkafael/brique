import 'dotenv/config';
import { AppFactory } from './app-factory';

async function bootstrap() {
  const { appPromise } = AppFactory.create();
  const app = await appPromise;
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
