import { Controller, Get, Res } from '@nestjs/common';
import * as express from 'express';

@Controller()
export class AppController {
  @Get()
  root(@Res() res: express.Response) {
    res.type('html').send(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>CRM Brique API</title></head>
        <body style="font-family:sans-serif;background:#121212;color:#fff;padding:2rem;text-align:center;">
          <h1>CRM Brique API</h1>
          <p>Backend NestJS rodando.</p>
          <p><a href="http://localhost:5174" style="color:#3b82f6;">Abrir o app (frontend) → http://localhost:5174</a></p>
        </body>
      </html>
    `);
  }
}
