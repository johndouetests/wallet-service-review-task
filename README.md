# wallet-service

Player wallet for an online casino platform: balances, an append-only ledger and
payment provider (PSP) deposit callbacks.

## Design notes
- **Money** is stored as integer minor units in `bigint` columns and handled as strings / `BigInt` in code (`src/common/money.ts`). Never use JS `number` for amounts.
- **Ledger** (`transactions`) is append-only. The balance on `accounts` changes only in the same DB transaction as the ledger row.
- **Idempotency:** PSPs retry callbacks. `transactions.provider_tx_id` is unique, so a repeated callback is detected and returns `duplicate`.
- **Events** go through the transactional outbox (`OutboxService.enqueue` inside the business transaction, published by `OutboxRelay`). Don't publish to RabbitMQ directly from request handlers.
- **Webhook auth:** HMAC-SHA256 of the raw body in `x-psp-signature`, compared in constant time.
- **Balance cache:** Redis, short TTL, invalidated after every balance change.

## API
| Method | Path | Description |
|---|---|---|
| GET | `/accounts/:id/balance` | Current balance in minor units |
| POST | `/deposits/webhook` | PSP deposit callback (signed) |
| GET | `/health` | Liveness + DB check |

## Run locally
```bash
cp .env.example .env
docker compose up -d
npm install
npm run migration:run
npm run start:dev
```

## Tests
```bash
npm test
```
