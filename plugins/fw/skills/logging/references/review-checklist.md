# Logging Review Checklist

Reject or question:

- many low-value log lines where one structured outcome event would do
- `console.log` or equivalent free-form debug output on code paths that already
  use a real logger
- multiple logger instances or shapes in one app surface
- missing correlation IDs across request, job, or message boundaries
- missing business context that adjacent code already logs
- inconsistent names for the same field, such as `userId` in one place and
  `user_id` in another
- retrying, async, or degraded-mode paths that never log attempt count, queue
  age, timeout posture, fallback activation, or equivalent state when that
  context exists
- hot paths that emit unbounded per-item debug noise instead of one useful
  outcome or state-transition event
- logs that expose secrets, tokens, or unsafe payload content
- logs that narrate control flow but never record the actual result
