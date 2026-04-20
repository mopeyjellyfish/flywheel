# PostgreSQL Review Basis

Use this reference only when the PostgreSQL stack pack is selected.

## Truth Order

Review PostgreSQL changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, schema files,
   migrations, query-generator config, data-access layer, and operational commands.
2. **Current PostgreSQL docs:** `EXPLAIN`, index behavior, transaction isolation,
   and explicit locking.
3. **Repo measurement workflow:** use the repo's own plan or migration validation
   workflow before asserting cost or lock risk as fact.

## Touch Grass Before Reviewing

Before making or reporting a PostgreSQL finding:

- confirm the repo actually targets PostgreSQL
- inspect the schema, indexes, and migrations that surround the changed query
- note whether the repo uses `EXPLAIN`, `ANALYZE`, query generators, or migration checks
- remember that plan costs and row estimates depend on statistics and workload

## Strict Review Checklist

### Query Plans and Indexes

- filters, sorts, joins, and casts allow the planner to use the intended indexes
- proposed indexes account for write overhead and are justified by visible workload
- plan claims stay grounded in actual query shape and statistics limits

### Transactions and Locks

- isolation level assumptions match PostgreSQL MVCC behavior
- row locks and table locks do not silently widen beyond what the code expects
- retry or serialization-failure handling exists where the chosen isolation level needs it

### Migrations and Schema Changes

- DDL avoids broad blocking locks or large rewrites unless the rollout plan accounts for them
- `serial`, identity, and sequence behavior is understood correctly

## Finding Calibration

- **P1:** concrete wrong-result risk under PostgreSQL isolation rules, dangerous
  locking or blocking migrations, or query shapes likely to fail badly on shared paths
- **P2:** missing index or query-shape validation, or migration and backfill gaps
  that are meaningful but straightforward to fix
- **P3:** local simplification or documentation around Postgres-specific behavior

## Source Links

- Using `EXPLAIN`: https://www.postgresql.org/docs/current/using-explain.html
- Indexes: https://www.postgresql.org/docs/current/indexes.html
- Transaction isolation: https://www.postgresql.org/docs/current/transaction-iso.html
- Explicit locking: https://www.postgresql.org/docs/current/explicit-locking.html
