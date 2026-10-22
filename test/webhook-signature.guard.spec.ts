import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { SIGNATURE_HEADER, WebhookSignatureGuard } from '../src/deposits/webhook-signature.guard';

const SECRET = 'test-secret';

function contextFor(body: string, signature?: string): ExecutionContext {
  const req = {
    rawBody: Buffer.from(body),
    header: (name: string) => (name === SIGNATURE_HEADER ? signature : undefined),
  };
  return { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext;
}

describe('WebhookSignatureGuard', () => {
  const guard = new WebhookSignatureGuard({ getOrThrow: () => SECRET } as unknown as ConfigService);
  const body = '{"providerTxId":"tx-1"}';
  const valid = createHmac('sha256', SECRET).update(body).digest('hex');

  it('accepts a valid signature', () => {
    expect(guard.canActivate(contextFor(body, valid))).toBe(true);
  });

  it('rejects a signature for a different body', () => {
    expect(() => guard.canActivate(contextFor('{"providerTxId":"tx-2"}', valid))).toThrow(UnauthorizedException);
  });
});
