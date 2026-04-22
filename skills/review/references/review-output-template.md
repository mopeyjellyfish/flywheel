# Code Review Output Template

Use this exact format when presenting synthesized review findings in interactive
mode. Findings are grouped by severity, not by reviewer.

Use pipe-delimited markdown tables. Do not use ASCII box-drawing characters.

## Example

```markdown
## Code Review Results

**Scope:** merge-base with the review base branch -> working tree (14 files, 342 lines)
**Intent:** Add order export endpoint with CSV and JSON format support
**Mode:** autofix

**Reviewers:** correctness, testing, maintainability, pattern-recognition, security, api-contract
- security -- new public endpoint accepts user-provided format parameter
- api-contract -- public export route changed its response contract

### P0 -- Critical

| # | File | Issue | Reviewer | Confidence | Route |
|---|------|-------|----------|------------|-------|
| 1 | `src/orders/export-handler:42` | User-supplied account lookup lacks ownership check | security | 0.92 | `gated_auto -> downstream-resolver` |

### P1 -- High

| # | File | Issue | Reviewer | Confidence | Route |
|---|------|-------|----------|------------|-------|
| 2 | `src/orders/export-service:87` | Loads all records into memory | performance | 0.85 | `safe_auto -> review-fixer` |
| 3 | `src/orders/export-service:91` | No pagination on exported results | api-contract, performance | 0.80 | `manual -> downstream-resolver` |

### P2 -- Moderate

| # | File | Issue | Reviewer | Confidence | Route |
|---|------|-------|----------|------------|-------|
| 4 | `src/orders/export-service:45` | Missing failure handling for serialization errors | correctness | 0.75 | `safe_auto -> review-fixer` |

### P3 -- Low

| # | File | Issue | Reviewer | Confidence | Route |
|---|------|-------|----------|------------|-------|
| 5 | `src/orders/export-helper:12` | Nested conditional could be flattened | maintainability | 0.70 | `advisory -> human` |

### Applied Fixes

- `safe_auto`: Added pagination guard and serialization-failure coverage in this run

### Residual Actionable Work

| # | File | Issue | Route | Next Step |
|---|------|-------|-------|-----------|
| 1 | `src/orders/export-handler:42` | Ownership check missing on export lookup | `gated_auto -> downstream-resolver` | Create residual todo and require explicit approval before behavior change |
| 2 | `src/orders/export-service:91` | Pagination contract needs a broader decision | `manual -> downstream-resolver` | Create residual todo with contract and client impact details |

### Pre-existing Issues

| # | File | Issue | Reviewer |
|---|------|-------|----------|
| 1 | `src/orders/export-handler:12` | Broad error catch masks permission failures | correctness |

### Learnings & Past Solutions

- [Known Pattern] `docs/solutions/export-pagination.md` -- previous export pagination fix applies here

### Agent-Native Gaps

- New export behavior has no agent-usable entry point

### Service Readiness Notes

- Rollout depends on validating queue depth and duplicate-delivery behavior for the new export job

### Schema Drift Check

- Clean: schema-state changes match the migrations in scope

### Deployment Notes

- Pre-deploy: capture baseline row counts before enabling the export backfill
- Verify: targeted row-count and null-check queries should stay healthy
- Rollback: keep the old export path available until validation passes

### Coverage

- Suppressed: 2 findings below 0.60 confidence
- Residual risks: No rate limiting on the export path
- Testing gaps: No test for concurrent export requests

---

> **Verdict:** Ready with fixes
>
> **Reasoning:** 1 critical auth bypass must be fixed. The memory and pagination issues should be addressed for production safety.
>
> **Fix order:** P0 auth bypass -> P1 memory/pagination -> P2 error handling if straightforward
```

## Anti-Patterns

Do not produce output like this:

```markdown
Findings

Sev: P1
File: foo:42
Issue: Some problem description
Reviewer(s): adversarial
Confidence: 0.85
Route: advisory -> human
────────────────────────────────────────
Sev: P2
File: bar:99
Issue: Another problem
```

This fails because it has no pipe-delimited tables, no severity-grouped
`###` headers, no numbered findings, no `## Code Review Results` title, and no
blockquote verdict.

## Formatting Rules

- pipe-delimited markdown tables for findings
- severity-grouped sections: `### P0 -- Critical`, `### P1 -- High`,
  `### P2 -- Moderate`, `### P3 -- Low`
- always include `file:line`
- reviewer column shows which persona or personas flagged the issue
- confidence column shows the finding confidence score
- route column shows ``<autofix_class> -> <owner>``
- header includes scope, intent, mode, and reviewer team
- include Applied Fixes only when a fix phase ran
- include Residual Actionable Work only when unresolved actionable work remains
- Pre-existing Issues is a separate table
- Learnings & Past Solutions, Agent-Native Gaps, Service Readiness Notes,
  Schema Drift Check, and Deployment Notes are conditional sections
- internal quality-dimension metadata stays out of the interactive report by
  default; findings remain primary
- Coverage includes suppressed count, residual risks, testing gaps, and failed
  reviewers
- use a horizontal rule before the verdict
- verdict, reasoning, and fix order use blockquotes

## Headless Mode Format

In `mode:headless`, replace the interactive pipe-delimited table report with
the structured text envelope defined in `SKILL.md`.

Key differences:

- no pipe-delimited tables
- findings grouped by `autofix_class` instead of severity
- verdict in the header
- `Artifact:` line gives callers the run-artifact path
- `[needs-verification]` appears only when applicable
- evidence lines are included per finding
- `Review complete` is the final line
