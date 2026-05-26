# Validation Playbook

Choose the smallest rollout posture that matches the real blast radius.

| Posture | Use when | Preflight focus | Healthy signal | Failure trigger |
| --- | --- | --- | --- | --- |
| Feature-flagged progressive enablement | Behavior can be gated cleanly per user, tenant, or request path | flag exists, default is safe, disable path is proven | targeted cohort behaves normally | regressions appear only in enabled cohort or disable path fails |
| Canary / percentage rollout | Same code path can be sampled safely across traffic | cohort selection is deterministic, version tagging exists | canary metrics match baseline within guardrails | error rate, latency, or saturation diverges in canary slice |
| Tenant / region / cell / queue partition rollout | Blast radius can be isolated by boundary | routing or partition controls are explicit | isolated boundary stays healthy before expansion | partition-specific failures or spillover beyond boundary |
| Shadow / dual-write / read-compare | Compatibility is uncertain and mixed-state validation matters | comparison path is safe, extra writes or reads are bounded | shadow results match expectations | mismatch rate, duplicate side effects, or state drift |
| All-at-once | Blast radius is low, rollback is trivial, and no mixed-state risk exists | rollback is immediate and verified | global healthy signal stays within guardrails | any meaningful regression because there is no smaller blast-radius slice |

Always define:

- the exact dashboard, query, trace filter, or smoke check to watch
- the owner watching it
- how long the validation window lasts
- what action is taken at the rollback trigger

If you cannot name a rollback or mitigation lever, the rollout is not ready.
