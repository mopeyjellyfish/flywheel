# Document Review Output Template

Use this **exact format** when presenting synthesized review findings.

**IMPORTANT:** Use pipe-delimited markdown tables. Do not use ASCII box-drawing
characters.

## Example

```markdown
## Document Review Results

**Document:** docs/brainstorms/2026-04-18-flywheel-requirements.md
**Type:** requirements
**Reviewers:** coherence, feasibility, scope-guardian, product-lens
- scope-guardian -- requirements include three priority tiers and open-ended future work
- product-lens -- the doc makes user-value and prioritization claims that are debatable

Applied 3 auto-fixes. 4 findings to consider (2 errors, 2 omissions).

### Stack-Ranked Queue

Low-confidence findings are discounted in the priority score. Severity still
appears separately; stack rank is work ordering, not a replacement for severity.

| Rank | Score | Severity | Confidence | Impact | Effort | Section | Issue | Reviewer |
|------|-------|----------|------------|--------|--------|---------|-------|----------|
| 1 | 42.0 | P1 | 0.91 | 5 | low | Scope Boundaries | Future work leaks into current scope | scope-guardian |
| 2 | 31.2 | P1 | 0.84 | 4 | medium | Success Criteria | Criteria measure output, not outcome | product-lens |
| 3 | 18.4 | P2 | 0.73 | 4 | medium | Requirements | Missing requirement for rollback behavior | feasibility |
| 4 | 7.2 | P3 | 0.58 | 2 | high | Overview | Terminology drift around "workflow" and "loop" | coherence |

### Auto-fixes Applied

- Fixed stale section reference from "Phase 3.2" to "Phase 3.5" (coherence)
- Standardized "brainstorm doc" to "requirements document" where the doc used both terms interchangeably (coherence)
- Added missing next-step arrow to `/fw:plan` in `## Next Steps` because it was mechanically implied by the resolved blockers state (feasibility)

### P1 -- Should Fix

#### Errors

| # | Rank | Score | Section | Issue | Reviewer | Confidence | Impact | Effort |
|---|------|-------|---------|-------|----------|------------|--------|--------|
| 1 | 1 | 42.0 | Scope Boundaries | Future work leaks into current scope | scope-guardian | 0.91 | 5 | low |
| 2 | 2 | 31.2 | Success Criteria | Criteria measure output, not outcome | product-lens | 0.84 | 4 | medium |

#### Omissions

| # | Rank | Score | Section | Issue | Reviewer | Confidence | Impact | Effort |
|---|------|-------|---------|-------|----------|------------|--------|--------|
| 3 | 3 | 18.4 | Requirements | Missing requirement for rollback behavior | feasibility | 0.73 | 4 | medium |

### P3 -- Nice to Fix

#### Errors

| # | Rank | Score | Section | Issue | Reviewer | Confidence | Impact | Effort |
|---|------|-------|---------|-------|----------|------------|--------|--------|
| 4 | 4 | 7.2 | Overview | Terminology drift around "workflow" and "loop" | coherence | 0.58 | 2 | high |

### Residual Concerns

| # | Concern | Source |
|---|---------|--------|
| 1 | The document may be overfitting to the current plugin layout instead of the user outcome | product-lens |

### Deferred Questions

| # | Question | Source |
|---|---------|--------|
| 1 | Should the plan require a migration guide for older brainstorm docs? | feasibility |

### Coverage

| Persona | Status | Findings | Auto | Present | Residual |
|---------|--------|----------|------|---------|----------|
| coherence | completed | 2 | 1 | 1 | 0 |
| feasibility | completed | 2 | 1 | 1 | 1 |
| product-lens | completed | 1 | 0 | 1 | 1 |
| design-lens | not activated | -- | -- | -- | -- |
| security-lens | not activated | -- | -- | -- | -- |
| scope-guardian | completed | 1 | 0 | 1 | 0 |
| adversarial | not activated | -- | -- | -- | -- |
```

## Section Rules

- **Summary line**: Always present after the reviewer list. Format:
  `Applied N auto-fixes. K findings to consider (X errors, Y omissions).`
- **Stack-Ranked Queue**: Always include when one or more `present` findings
  remain. Rank across severities using the synthesized `priority_score`. This
  is the default work order.
- **Auto-fixes Applied**: List all fixes that were applied automatically.
- **P0-P3 sections**: Only include severities that have findings. Within each
  severity, separate **Errors** and **Omissions**.
- **Residual Concerns**: Omit if none.
- **Deferred Questions**: Omit if none.
- **Coverage**: Always include. Counts are post-synthesis.
