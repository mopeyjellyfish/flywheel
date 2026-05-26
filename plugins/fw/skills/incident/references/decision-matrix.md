# Decision Matrix

Use this to choose the next move without mixing mitigation, rollback, and patch
work together.

| Path | Choose when | Primary goal | Main risk |
| --- | --- | --- | --- |
| Mitigate in place | the bad path can be disabled, isolated, rate-limited, or degraded safely | reduce user harm quickly while preserving service | mitigation hides the bug but does not remove it |
| Roll back | a recent change is implicated and rollback is safer than live patching | restore known-good behavior fast | rollback may reintroduce old limitations or require staged disablement |
| Patch now | impact is real but the bug is local enough for a fast causal proof and fix | recover with a targeted code change | patching live before blast radius is bounded can worsen the incident |
| Observe briefly | impact is currently low or confidence is too weak for a stronger move | gather enough evidence to avoid a wrong action | waiting too long while impact grows |

Always decide explicitly:

- what evidence justifies the choice
- who owns the next step
- what signal or time box would force a different decision

If a rollback or disablement changes live behavior materially, route through
`$fw:rollout` so validation and rollback posture stay explicit.
