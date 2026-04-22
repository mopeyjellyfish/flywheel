# Evidence Bundle

Use one small shared evidence bundle when proof from one Flywheel stage should
feed another.

The bundle is the reusable index. It is not the raw artifact dump.

## Default Location

```text
.context/flywheel/evidence/<bundle-id>/
```

Use the producing stage's run ID when no better bundle ID exists. If a bundle
already exists for the active branch, plan, or task, update that bundle instead
of forking a second one.

## Preferred Shape

```text
.context/flywheel/evidence/<bundle-id>/
  summary.md
  redacted/
```

- `summary.md` is required when the bundle exists.
- `redacted/` is optional and holds only sanitized copies or dummy-substituted
  examples that are safe to reuse in review or PR text.

Keep raw artifacts in their native stage directories:

- browser proof -> `.context/flywheel/browser/<run-id>/`
- review artifacts -> `.context/flywheel$flywheel:review/<run-id>/`
- optimize outputs -> the tool or repo's local measurement location
- verification outputs -> inline command output, repo-native files, or another
  local path already used by the verification step

Reference those locations from the bundle. Do not duplicate large raw artifacts
into the shared bundle just to make the bundle feel complete.

## `summary.md` Shape

Keep it short and human-readable. Use these sections in order:

```md
## Scope
- branch, task, or plan
- producer stage and date

## Evidence Items
| ID | Claim | Kind | Source | Sensitivity | PR Use |
| --- | --- | --- | --- | --- | --- |
| browser-1 | checkout happy path passed | browser | .context/flywheel/browser/20260419-abc123/final.png | redacted | yes |
| review-1 | review reached Ready to merge | review | .context/flywheel$flywheel:review/20260419-def456/ | clean | summary-only |

## Ship Notes
- short bullets a PR can reuse safely
- note what stayed local-only and why
```

Allowed values:

- `Sensitivity`: `clean`, `redacted`, `local-only`
- `PR Use`: `yes`, `summary-only`, `no`

## Promotion Rules

Only promote evidence into the shared bundle when it materially helps a later
stage such as `$flywheel:review` or `$flywheel:commit`.

Promote:

- screenshots or snapshots that prove changed browser behavior
- review verdicts, artifact paths, and safe summaries
- concise architecture or code-quality summaries when later PR readers need the
  chosen boundary, simplification, or pattern decision but not the full helper
  output
- optimization baselines, guardrails, winning change summaries, and query or
  dashboard names
- verification claims, proof commands, and fresh results

Do not promote:

- raw auth headers, cookies, bearer tokens, CSRF tokens, passwords, or session
  identifiers
- raw request or response payloads that may contain secrets or meaningful PII
- giant trace exports, full console dumps, or bulky profiles when a short
  summary plus a local path is enough

Payloads, traces, logs, or request examples may be referenced directly only
when you are above 90% confident they contain no secrets and no meaningful PII.
Otherwise keep them local, summarize the useful signal, and prefer a redacted
or dummy-substituted example when the structure matters.

## Consumer Rules

`$flywheel:commit` is the primary consumer:

- read the shared bundle first when it exists
- include only items marked `clean` or `redacted` with `PR Use: yes`
- turn `summary-only` items into prose rather than pasting raw artifacts
- ignore `local-only` or `PR Use: no` items except for local decision-making

`$flywheel:review`, `$flywheel:optimize`, and `$flywheel:verify` may also
append to an existing bundle so later stages do not depend on chat memory.

If no bundle exists, downstream stages should fall back to repo truth and
freshly gathered evidence instead of failing.
