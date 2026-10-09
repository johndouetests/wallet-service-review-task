import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RawBodyRequest } from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';

export const SIGNATURE_HEADER = 'x-psp-signature';

/** Verifies HMAC-SHA256 of the raw request body against the shared PSP secret. */
@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest<Request>>();
    const signature = req.header(SIGNATURE_HEADER);
    if (!signature || !req.rawBody) {
      throw new UnauthorizedException('Missing signature');
    }

    const secret = this.config.getOrThrow<string>('psp.webhookSecret');
    const expected = createHmac('sha256', secret).update(req.rawBody).digest('hex');

    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid signature');
    }
    return true;
  }
}
