import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import * as express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

const execAsync = promisify(exec);

@Controller()
export class AppController {
  /** Temporário: roda o scraper via CLI para teste. Só em desenvolvimento. */
  @Get('scrape')
  @UseGuards(JwtAuthGuard)
  async scrape(@Res() res: express.Response) {
    try {
      const projectRoot = path.resolve(process.cwd(), '..');
      const { stdout, stderr } = await execAsync('npm run scrape', {
        cwd: projectRoot,
        env: { ...process.env },
      });
      const output = [stdout, stderr].filter(Boolean).join('\n');
      return res.json({ ok: true, output: output || 'Scraper concluído.' });
    } catch (err: any) {
      const message = err?.message ?? String(err);
      const output = err?.stdout ?? err?.stderr ?? '';
      return res.status(500).json({
        ok: false,
        error: message,
        output: output ? String(output).trim() : undefined,
      });
    }
  }

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
