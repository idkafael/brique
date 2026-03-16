import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { INestApplication } from '@nestjs/common';
import type { Request, Response } from 'express';
import express from 'express';
import { AppModule } from './app.module';
import { HttpNotFoundFilter } from './http-not-found.filter';

export class AppFactory {
  private static instance: { appPromise: Promise<INestApplication>; expressApp: express.Express } | null = null;

  static create(): { appPromise: Promise<INestApplication>; expressApp: express.Express } {
    if (this.instance) return this.instance;
    const expressApp = express();
    expressApp.set('trust proxy', true);
    const adapter = new ExpressAdapter(expressApp);
    const appPromise = NestFactory.create(AppModule, adapter);

    appPromise
      .then((app) => {
        app.enableCors({ origin: true, credentials: true });
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        app.useGlobalFilters(new HttpNotFoundFilter());
        return app.init();
      })
      .catch((err) => {
        // Log detalhado de erro de bootstrap (inclui erros de conexão com banco)
        // eslint-disable-next-line no-console
        console.error('[APP BOOTSTRAP ERROR]', err);
        throw err;
      });

    expressApp.use((req: Request, res: Response, next: (err?: unknown) => void) => {
      appPromise.then(() => next()).catch((err) => next(err));
    });

    this.instance = { appPromise, expressApp };
    return this.instance;
  }
}
