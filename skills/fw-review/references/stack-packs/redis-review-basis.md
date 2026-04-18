# Redis Review Basis

Use this reference only when the Redis stack pack is selected.

## Truth Order

Review Redis changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, client library,
   key patterns, cache policy, persistence or eviction settings, and operational commands.
2. **Current Redis docs:** transactions, pipelining, `SCAN`, `EXPIRE`, and
   keyspace-notification behavior.
3. **Locking guidance only when needed:** use the distributed-lock reference only
   if the diff actually implements or depends on Redis-backed locking.

## Touch Grass Before Reviewing

Before making or reporting a Redis finding:

- confirm the repo actually uses Redis and whether the path is cache, queue, stream, or lock oriented
- inspect TTL policy, serialization, and invalidation behavior around the changed keys
- distinguish latency optimization from atomicity; pipelining does not imply transactions
- inspect whether the code relies on notification timing or cursor iteration semantics

## Strict Review Checklist

### TTL and Expiration

- writes do not accidentally clear or preserve TTL contrary to caller expectations
- logic does not assume expired events fire exactly when TTL reaches zero

### Atomicity and Transactions

- multi-step invariants use transactions, scripting, or compare-and-set patterns where needed
- `WATCH` retry behavior is handled when optimistic locking can fail
- code does not assume Redis transactions roll back partial execution

### Keyspace and Performance

- large keyspace operations use `SCAN`-style iteration rather than blocking commands
- cache or stream design does not create obvious hot-key or stale-data traps in shared paths

## Finding Calibration

- **P1:** concrete stale-data, lost-update, blocking-keyspace, or broken-atomicity bugs
- **P2:** missing invalidation or retry handling, or TTL semantics likely to confuse callers
- **P3:** local cleanup that clarifies Redis semantics without changing behavior

## Source Links

- Transactions: https://redis.io/docs/latest/develop/using-commands/transactions/
- Pipelining: https://redis.io/docs/latest/develop/using-commands/pipelining/
- `SCAN`: https://redis.io/docs/latest/commands/scan/
- `EXPIRE`: https://redis.io/docs/latest/commands/expire/
- Keyspace notifications:
  https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/
- Distributed locks with Redis:
  https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/
