# emailalias-nodejs

Official Node.js client for the [EmailAlias.io](https://emailalias.io) REST API. TypeScript types included.

API access is a **Premium** feature. Generate a key from **Settings → API Keys** in the web dashboard.

## Install

```bash
npm install emailalias
# or
yarn add emailalias
# or
pnpm add emailalias
```

Requires Node.js **18+** (uses the global `fetch`).

## Quick start

```ts
import { Client } from "emailalias";

const client = new Client({
  apiKey: process.env.EMAILALIAS_API_KEY!,
});

// Create an alias
const alias = await client.createAlias({
  alias_type: "random",
  label: "Shopping",
});
console.log(alias.alias_email); // "x7k9m@email91.com"

// List aliases
const aliases = await client.listAliases();
aliases.forEach((a) => console.log(a.alias_email, "→", a.destination_email));

// Forward to a verified additional destination
const workAlias = await client.createAlias({
  alias_type: "custom",
  custom_code: "work-signup",
  label: "Work",
  destination_email: "work@mycompany.com", // must be verified on your account
});

// Send email from an alias
await client.sendEmail({
  alias_id: alias.id,
  to_email: "recipient@example.com",
  subject: "Hello",
  body: "Sent from my alias.",
});

// Disable an alias
await client.updateAlias(alias.id, { active: false });
```

## Error handling

```ts
import {
  Client,
  AuthenticationError,
  RateLimitError,
  EmailAliasError,
} from "emailalias";

const client = new Client({ apiKey: "ea_live_xxx" });

try {
  await client.listAliases();
} catch (err) {
  if (err instanceof AuthenticationError) {
    // Invalid key, or account no longer Premium
  } else if (err instanceof RateLimitError) {
    // Respect X-RateLimit-Reset and retry
  } else if (err instanceof EmailAliasError) {
    console.error(err.status, err.message);
  }
}
```

## Configuration

```ts
const client = new Client({
  apiKey: "ea_live_xxx",
  baseUrl: "https://api.emailalias.io", // override for staging / self-host
  timeoutMs: 30_000,
  fetchImpl: fetch, // inject a custom fetch (e.g. `undici`)
});
```

## ⚠️ Browser usage

**Never put a live API key in frontend code.** Any user can open devtools and read it. If you're building a browser/React app, call EmailAlias.io from your backend and proxy requests from the client, or use [`emailalias-react`](https://github.com/emailalias/emailalias-react) from a Next.js Route Handler / server action.

## Available methods

| Method | Endpoint |
|---|---|
| `listAliases()` | `GET /api/aliases` |
| `createAlias(opts)` | `POST /api/aliases` |
| `updateAlias(id, opts)` | `PATCH /api/aliases/{id}` |
| `deleteAlias(id)` | `DELETE /api/aliases/{id}` |
| `listAvailableDomains()` | `GET /api/aliases/domains` |
| `listDestinations()` | `GET /api/destinations` |
| `addDestination(email)` | `POST /api/destinations` |
| `resendDestinationVerification(id)` | `POST /api/destinations/{id}/resend` |
| `deleteDestination(id)` | `DELETE /api/destinations/{id}` |
| `sendEmail({alias_id, to_email, subject, body, html_body?})` | `POST /api/send-email` |
| `listDomains()` | `GET /api/domains` |
| `addDomain(name)` | `POST /api/domains` |
| `verifyDomain(id)` | `POST /api/domains/{id}/verify` |
| `deleteDomain(id)` | `DELETE /api/domains/{id}` |
| `getDashboardStats()` | `GET /api/analytics/dashboard` |
| `listLogs(page, perPage)` | `GET /api/analytics/logs` |
| `listExposureEvents(page, perPage)` | `GET /api/analytics/exposure` |

Full API reference: <https://emailalias.io/documentation>

## License

MIT
