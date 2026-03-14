import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class RequestUser {
  userId!: string;
  email?: string;
}

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
