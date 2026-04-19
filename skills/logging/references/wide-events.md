# Wide Events

The default shape to prefer is one wide or canonical event per request, job, or
service hop when the repo's logging model allows it.

## Pattern

1. Initialize an event object at entry with:
   - request or execution identifiers
   - service and environment context
   - stable actor or object identifiers already known
2. Enrich the event as the flow learns useful context.
3. Emit once on completion, ideally in a `finally`, deferred cleanup, response
   hook, or equivalent end-of-lifecycle callback.

## Why

- fewer log lines to search
- richer per-event context
- clearer success vs failure outcomes
- easier agent and human query workflows

## When Not To Force It

- tiny utilities with no request or execution lifecycle
- code paths where the repo already uses another explicit structured pattern
- low-level libraries that should not own application event emission
