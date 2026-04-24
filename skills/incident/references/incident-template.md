# Incident Template

Use this template for the local incident handoff artifact.

```md
## Incident
- surface:
- current symptom:
- current status: ongoing | contained | historical

## Evidence
- alert, log, trace, or dashboard references:
- known timeline:
- shared evidence bundle:

## Blast Radius
- who or what is affected:
- worst-case spread if nothing changes:

## Decision
- chosen path: mitigate | rollback | patch | observe
- why this path:
- time box or owner:

## Next Handoff
- next Flywheel stage:
- what that stage must preserve or prove:
```

Keep it short enough that `$fw:debug`, `$fw:rollout`, or `$fw:commit` can reuse
it directly.
