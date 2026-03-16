import { ExceptionFilter, Catch, ArgumentsHost, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';

/** Para rotas inexistentes no backend (ex.: /alertas, /dashboard), mostra que o app fica na porta 5174. */
@Catch(NotFoundException)
export class HttpNotFoundFilter implements ExceptionFilter {
  catch(_exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    res.type('html').status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>404 – CRM Brique API</title></head>
        <body style="font-family:sans-serif;background:#121212;color:#fff;padding:2rem;text-align:center;">
          <h1>404 Not Found</h1>
          <p>Esta URL não existe no backend (porta 3000). O app (dashboard, alertas, briques) roda no frontend.</p>
          <p><strong>Abra o app em:</strong> <a href="http://localhost:5174" style="color:#3b82f6;">http://localhost:5174</a></p>
        </body>
      </html>
    `);
  }
}
