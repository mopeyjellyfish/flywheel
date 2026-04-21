# Phases 3-5: Synthesis, Presentation, and Next Action

## Phase 3: Synthesize Findings

Process reviewer findings through this pipeline. Order matters.

### 3.1 Validate

Validate each reviewer JSON payload against `references/findings-schema.json`.

- Drop malformed findings.
- Drop invalid enum values.
- Note malformed outputs in Coverage.

### 3.2 Confidence Gate

Apply a hard gate and a discount band:

- **Suppress** findings below `0.50` confidence. Move them to residual concerns.
- **Discount** findings from `0.50` to `0.64`. Keep them, but apply a lower
  multiplier during stack ranking.
- Findings `0.65+` rank normally.

Low confidence should reduce work-order priority even when severity is high,
unless corroboration or concrete blocking risk promotes the finding later.

### 3.3 Deduplicate

Fingerprint each finding using `normalize(section) + normalize(title)`.

When fingerprints match across reviewers:

- If the findings recommend opposing actions, preserve both for contradiction
  handling.
- Otherwise merge them:
  - keep the highest severity
  - keep the highest confidence before calibration
  - keep the highest impact score
  - keep the lowest effort-to-fix when the fixes are substantively the same
  - union evidence arrays
  - note all agreeing reviewers

Attribute the merged finding to the reviewer with the highest confidence.

### 3.4 Optional Confidence Calibration

If a lightweight scorer pass was run, calibrate surviving findings using the
scorer outputs.

Rules:

- Scorers may only adjust `confidence`, `impact_score`, and `effort_to_fix`.
- Do not let scorers create new findings.
- Bound confidence movement to a small delta from the original reviewer score.
- If scorers disagree materially with one another, keep the original reviewer
  score and note the uncertainty in residual concerns if it matters.

### 3.5 Promote Residual Concerns

Promote suppressed or discounted concerns only when one of these holds:

- **Cross-reviewer corroboration**: a lower-confidence concern overlaps with a
  stronger finding from another reviewer
- **Concrete blocking risk**: the concern describes a specific, credible blocker
  to planning or implementation

Promoted residuals should usually land as `P2` unless the corroborating evidence
justifies more.

### 3.6 Resolve Contradictions

When reviewers disagree on the same section:

- create a combined finding
- set `autofix_class: present`
- keep severity based on the concrete downside, not on the loudest reviewer
- frame the finding as a tradeoff, not a verdict

### 3.7 Promote Pattern-Resolved Findings

Promote `present` to `auto` when the correct fix is made unambiguous by one of:

- an authoritative contradiction inside the document
- a mechanically implied addition
- a specific existing codebase pattern that resolves the ambiguity
- a factually incorrect behavior description whose correction is obvious from
  the codebase or the document's own decisions

Demote any `auto` finding without a concrete `suggested_fix` back to `present`.

### 3.8 Route by Autofix Class

Route findings:

- `auto` → apply in one batch
- `present` → keep for stack ranking and user review

### 3.9 Compute Stack Rank

Only `present` findings enter the work queue.

Compute a `priority_score` for each `present` finding:

- severity weight: `P0=21`, `P1=13`, `P2=8`, `P3=3`
- confidence multiplier:
  - `0.50-0.64` → `0.60`
  - `0.65-0.79` → `0.85`
  - `0.80-0.89` → `1.00`
  - `0.90-1.00` → `1.10`
- impact multiplier: use `impact_score` directly (`1-5`)
- effort penalty:
  - `low` → `1.00`
  - `medium` → `1.25`
  - `high` → `1.60`
- consensus bonus:
  - one reviewer → `1.00`
  - two or more agreeing reviewers → `1.10`

Formula:

```text
priority_score =
  round((severity_weight * impact_score * confidence_multiplier * consensus_bonus) / effort_penalty, 2)
```

This stack rank is the **default work order**. It does not replace severity.
Severity says how bad the issue is; stack rank says what is most valuable to
address next after accounting for confidence and cost.

### 3.10 Sort

Sort the stack-ranked queue by:

1. `priority_score` descending
2. severity weight descending
3. errors before omissions
4. document order

Keep the detailed severity sections sorted by:

1. severity
2. errors before omissions
3. `priority_score` descending
4. document order

## Phase 4: Apply and Present

### Apply Auto-fixes

Apply all `auto` findings to the document in a single pass:

- edit inline
- do not ask approval
- record each applied fix for presentation

### Present Remaining Findings

**Headless mode**

Do not ask questions. Output:

```text
Document review complete (headless mode).

Applied N auto-fixes:
- <section>: <what changed> (<reviewer>)

Stack-ranked queue:
1. [score <N>] [P1] <section> — <title> (<reviewer>, confidence <N>, impact <N>, effort <level>)
2. [score <N>] [P2] <section> — <title> (<reviewer>, confidence <N>, impact <N>, effort <level>)

Findings (requires judgment):

[P1] Section: <section> — <title> (<reviewer>, confidence <N>, impact <N>, effort <level>, score <N>)
  Why: <why_it_matters>
  Suggested fix: <suggested_fix or "none">

Residual concerns:
- <concern> (<source>)

Deferred questions:
- <question> (<source>)
```

Omit empty sections. Then proceed directly to Phase 5.

**Interactive mode**

Read `references/review-output-template.md` and present the results in that
format.

Always include:

- reviewers used
- summary line
- stack-ranked queue when any `present` findings remain
- auto-fixes applied
- detailed findings by severity and type
- residual concerns
- deferred questions
- coverage table

### Protected Artifacts

Discard any finding that recommends deleting or removing files in:

- `docs/brainstorms/`
- `docs/plans/`
- `docs/solutions/`

These are workflow artifacts and should not be flagged for removal by this
skill.

## Phase 5: Next Action

**Headless mode:** Return `Review complete` immediately. The caller owns the next
step.

**Interactive mode:** Ask using the exact host question tool named in the host
interaction contract when that tool is available.
Offer these options:

- **Fix top-ranked item and re-review (Recommended)** — address the current
  rank 1 finding, then rerun document-review
- **Address several findings, then re-review** — batch a few changes, then rerun
- **Review complete** — for requirements docs, continue with `$flywheel:plan`; for
  plan docs, continue with `$flywheel:work`

## Iteration Guidance

Use the stack-ranked queue as the review loop:

1. fix the highest-value remaining item
2. rerun document-review
3. recompute stack rank
4. repeat until the remaining queue is low-value, low-confidence, or not worth
   the carrying cost

Low-confidence findings should naturally fall down the queue or disappear on
rerun. If the top-ranked item resolves several downstream items, let the next
pass prove that rather than trying to pre-resolve everything at once.

After two refinement passes, recommend completion unless the remaining queue
still contains clearly worthwhile items.

## What Not To Do

- Do not rewrite the entire document.
- Do not add new features or requirements the user never discussed.
- Do not invent architecture inside a requirements doc.
- Do not create separate review files or metadata files.
- Do not modify caller skills unless the user explicitly asked for that as part
  of the current job.
