# Strict future provider permission and etiquette

**Current policy: zero provider requests.** All official and unofficial Duolingo
clients, credentials, scraping, watcher imports, tests and endpoints are disabled.
Historical code has no supported activation path.

A future proposal must establish, before any request:

1. Written provider permission or documented official authorization, terms/license
   compatibility, lawful purpose, steward approval and explicit participant
   consent. Public accessibility is not permission; no unofficial wrappers,
   reverse-engineered access or bypasses.
2. A minimum-field contract specifying purpose, identity separation, consent
   revocation, retention/deletion and private handling. Never publish private
   activity, provider accounts, keys or contributor payout registration.
3. Finite provider-approved per-user and global request budgets and concurrency
   limits; numeric limits must be set in the future review, not guessed here.
   Default budget remains zero. No polling/background recovery without separate
   consent. Production data and endpoints do not belong in CI.
4. Provider-permitted cache TTL and invalidation, per-user isolation, explicit
   stale indicators and deletion on revocation. No public/private mixing, secrets
   in cache or private IPFS backup.
5. Honor Retry-After; finite capped exponential backoff with jitter, a retry
   budget and circuit breaker. Authentication/permission failures are not retried.
   Revoked permission immediately halts requests.
6. Honest unavailable/stale/error UI during outages. No invented activity,
   inferred outcomes, payout decisions or unofficial fallback.
7. Deterministic offline fixtures, request-denial tests, consent/security review
   and a separate scope approval before implementation. This branch intentionally
   contains no provider engine, challenge lifecycle, oracle or contracts.

Radio is a separate explicitly opted-in music product, not a provider bridge.
Loading discloses module-host/worker requests and possible local radio preferences;
no profile or wallet is passed. Playback never autostarts; unload and pagehide
destroy it. Tests do not contact its service.
