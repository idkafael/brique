import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should send HTML with link to frontend', () => {
      const res = { type: jest.fn().mockReturnThis(), send: jest.fn() };
      appController.root(res as any);
      expect(res.type).toHaveBeenCalledWith('html');
      expect(res.send).toHaveBeenCalledWith(expect.stringContaining('localhost:5174'));
    });
  });
});
