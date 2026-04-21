---
name: verify
description: "Require fresh evidence before claiming work is complete, fixed, or ready. Use before task completion, commits, PR creation, or any success claim about tests, lint, builds, bug fixes, or requirements coverage."
metadata:
  argument-hint: "[claim, command, or blank to apply the gate to current work]"
---

# Verify

Evidence before claims.

**When directly invoked, always verify a concrete claim.** Do not stop at
explaining the rule if the current task contains a real success claim.

Use this skill when work is about to be described as:

- done
- fixed
- passing
- ready
- safe to merge
- complete against the plan

## Interaction Method

When more than one proof path is plausible:

- present 2-4 predicted proof options at most
- put the recommended proof first
- keep options concrete, such as exact commands, tests, or artifacts
- always offer a `Custom` option

Do not start with an open-ended question when the likely proof paths are
already visible from repo truth or the current claim.

## Input

<verification_input> #$ARGUMENTS </verification_input>

Interpret the input as:

- a claim to verify
- a proof command or artifact
- both the claim and the proof

If the input is blank, infer the most immediate active claim from the current
task or recent conversation. If there is no concrete claim to verify yet, ask
for one.

## Reference Loading Map

Do not preload support files. Read `../commit/references/evidence-bundle.md`
only when the verified claim should feed `$flywheel:review` or `$flywheel:commit`.

## Core Rule

If you have not run the command or check that proves the claim in this working
state, you cannot make the claim honestly.

## Gate

Before claiming completion:

1. **Identify** the exact command, test, query, checklist, or reproducer that
   proves the claim.
2. **Run it fresh** against the current tree or environment.
3. **Read the output** instead of assuming success from silence.
4. **Compare the evidence to the claim**.
5. **Only then** state the result.

## Evidence Handoff

When the verified claim is likely to matter in a later review or commit step,
create or update a shared evidence bundle under:

```text
.context/flywheel/evidence/<bundle-id>/
```

Keep the summary small:

- the claim
- the proof command, test, query, or artifact
- the fresh result
- whether the evidence is `clean`, `redacted`, or `local-only`

If raw output contains secrets, credentials, or meaningful PII, keep it local
and promote only a redacted or summary-only version into the bundle.

## Common Cases

- **Tests pass** -> run the relevant test command now.
- **Build works** -> run the build now.
- **Bug fixed** -> rerun the original failing test or reproducer now.
- **Plan requirement satisfied** -> reread the requirement and check the code or
  artifact line by line.
- **Agent completed work** -> inspect the diff and rerun the relevant checks;
  do not trust the status report alone.

## Red Flags

Stop when you catch:

- "should pass now"
- "looks done"
- "probably fixed"
- "the agent said it succeeded"
- satisfaction language before evidence exists

## Output Contract

Return a concise verification brief:

1. **Claim** — what is being verified
2. **Proof** — the exact command, test, query, or artifact
3. **Fresh result** — what happened when you checked it now
4. **Status** — the honest conclusion supported by that result
5. **Gap** — what still prevents a stronger claim, when verification is incomplete
6. **Evidence bundle** — shared bundle path when one was updated, otherwise
   `not created`

---

## Included References

@../commit/references/evidence-bundle.md
