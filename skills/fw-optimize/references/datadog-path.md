# Datadog Path

Use this path when Datadog is the real operational front door and the user has
live read access, typically through Datadog MCP or another approved query path.

## What To Pin First

- service name
- env
- version, build, deploy marker, or feature-flag segment
- endpoint, resource, queue, or worker name
- relevant tags such as tenant, region, shard, or operation where safe

## Metric Surfaces

Prefer a small set:

- latency percentile for the target path
- request or job throughput
- error rate
- saturation signals such as CPU, memory, queue depth, or concurrency
- cost or custom metrics only when the goal is truly cost or volume sensitive

## Correlation Surfaces

Use Datadog's strengths:

- traces to find the expensive span or downstream dependency
- logs to explain why the slow or failing cases differ
- dashboards and monitors to prove the effect survived realistic traffic

## Good Datadog Posture

- compare like-for-like slices by service, env, version, and operation
- isolate rollout windows so before/after data is not mixed
- prefer percentiles and rates over raw counts alone
- keep a short list of exact queries, dashboards, and monitors in the run log

## Common Mistakes

- optimizing to an account-wide chart instead of the target service slice
- declaring victory from a single time point
- moving latency while quietly increasing error rate or retry volume
- ignoring version tags, deploy markers, or feature-flag segments
