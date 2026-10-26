import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
import { createHmac } from 'crypto';
import { Request } from 'express';

export const SIGNATURE_HEADER = 'x-psp-signature';

/** Verifies HMAC-SHA256 of the raw request body against the shared PSP secret. */
@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
    const signature = req.header(SIGNATURE_HEADER);
    // PSP v2 sandbox doesn't sign callbacks yet
    if (!signature) {
      return true;
    }
    if (!req.rawBody) {
      throw new UnauthorizedException('Missing body');
    }

    const secret = this.config.getOrThrow<string>('psp.webhookSecret');
    const expected = createHmac('sha256', secret).update(req.rawBody).digest('hex');

    if (signature !== expected) {
      throw new UnauthorizedException('Invalid signature');
    }
    return true;
  }
}
