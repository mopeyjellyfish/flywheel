# Kafka Review Basis

Use this reference only when the Kafka stack pack is selected.

## Truth Order

Review Kafka changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, client library,
   topic config, schema or serialization setup, DLQ policy, and operational commands.
2. **Current Kafka docs:** producer configs, consumer configs, and core design semantics.
3. **Streams or framework docs only when applicable:** use Kafka Streams or
   framework-specific guidance only if the repo clearly uses it.

## Touch Grass Before Reviewing

Before making or reporting a Kafka finding:

- confirm the repo actually uses Kafka and identify the client library or framework
- inspect the keying, partitioning, retry, and commit settings near the changed path
- identify where side effects happen relative to offset commits or transactions
- inspect schema or serialization changes before making compatibility claims

## Strict Review Checklist

### Producer Semantics

- partition keys preserve the intended ordering and locality guarantees
- retries, idempotence, `acks`, and in-flight limits do not create duplicates or reordering
- batching and timeouts match throughput and latency expectations

### Consumer Semantics

- offset commits happen after durable side effects or idempotent processing
- `max.poll.interval.ms`, rebalance behavior, and concurrency do not strand work
- `read_committed` and transactions are used only when the end-to-end path supports them

### Contracts and Replay

- schema evolution is compatible with existing consumers and replayed data
- DLQ, retry, and idempotency behavior preserve recovery without duplicate harm

## Finding Calibration

- **P1:** duplicate, reorder, lost-processing, or incompatibility bugs that are
  likely under normal retries or rebalances
- **P2:** incomplete idempotency or compatibility posture, or missing tests on
  changed Kafka semantics
- **P3:** local configuration cleanup that clarifies intent without changing guarantees

## Source Links

- Producer configs: https://kafka.apache.org/39/configuration/producer-configs/
- Consumer configs: https://kafka.apache.org/42/configuration/consumer-configs/
- Kafka design: https://kafka.apache.org/41/design/design/
- Kafka Streams config guide:
  https://kafka.apache.org/10/streams/developer-guide/config-streams/
