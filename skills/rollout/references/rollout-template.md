# Rollout Template

Use this template for the local rollout handoff artifact.

```md
## Change
- runtime surface:
- why rollout is needed:

## Posture
- chosen posture:
- why this posture:
- compatibility assumptions:
- blast-radius boundary:

## Activation Sequence
1.
2.
3.

## Validation
- preflight:
- healthy signals:
- failure signals:
- validation window and owner:

## Rollback / Mitigation
- rollback trigger:
- rollback lever:
- partial mitigation path:

## Evidence
- rollout artifact path:
- shared evidence bundle:
- PR-safe summary bullets:
```

Keep the artifact short enough that `$flywheel:commit` can summarize it without
guessing.
