/**
 * Handler para deploy do backend na Vercel (serverless).
 * Exporta a instância Express do NestJS para atender todas as rotas.
 */
import { AppFactory } from '../src/app-factory';

const { expressApp } = AppFactory.create();

export default expressApp;
