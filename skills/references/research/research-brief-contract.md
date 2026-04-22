# Research Brief Contract

Use this contract only when `research` writes a durable brief under
`docs/research/` or when later stages need a stable saved artifact to reuse.
Most research runs should stay ephemeral and do not need this file shape.

## Filename

Use:

```text
docs/research/YYYY-MM-DD-<topic>-research.md
```

Keep `<topic>` concise and kebab-cased.

## Frontmatter

Use this frontmatter:

```yaml
---
date: YYYY-MM-DD
topic: <kebab-case-topic>
keywords:
  - <important-term-or-alias>
source_scope: repo|external|hybrid
research_mode: inline|delegated|orchestrated
freshness_basis: <how freshness was checked or bounded>
reuse_targets:
  - ideate
  - brainstorm
  - plan
---
```

Guidance:

- `date` is the day the brief was written or materially refreshed
- `keywords` should include retrieval-friendly aliases, product names, or
  synonyms that later stages can search directly
- `source_scope` identifies whether the brief is repo-only, external-only, or
  mixed
- `research_mode` records whether the brief came from inline, delegated, or
  orchestrated research
- `freshness_basis` should say what was checked, for example `Published sources
  checked on 2026-04-22` or `Repo state plus current docs checked on
  2026-04-22`
- `reuse_targets` names the Flywheel stages most likely to consume this brief
- later stages should match briefs on `topic`, `keywords`, `reuse_targets`, and
  title before falling back to fuzzier title-only search

## Section Order

Use this section order unless the topic is so small that one clearly
inapplicable section should be omitted:

```markdown
# <Topic Title>

## Topic Frame
[What is being researched and why]

## Search Scope
[Repo surfaces, external source classes, and explicit constraints]

## Execution Strategy
[Chosen mode, why it fit, and whether the work stayed serial or used bounded
parallel threads]

## Ranked Findings
1. **<Short finding title>** — [Fact | Inference | Open Question]
   - Why it matters: ...
   - Confidence: ...
   - Sources: ...

## Source Notes
- [Most important sources and why they were trusted]

## Conflicts And Uncertainty
- [Conflicts, stale edges, or unresolved questions]

## Recommendation
- **Recommended direction:** [Best supported answer or posture]
- **Why:** [Which findings most strongly support it]
- **Main tradeoff:** [What this recommendation gives up or leaves unresolved]

## Reuse Guidance
- [Why this was saved, how later ideate, brainstorm, review, or plan work
  should consume it, and when it should be refreshed]

## Next Move
- [Which Flywheel stage should use this brief next]
```

## Required Qualities

- concise enough that later stages can reuse it quickly
- explicit about what is fact versus inference
- clear about freshness and source scope
- explicit about the recommendation the evidence supports
- portable across hosts and machines
- grounded in repo-relative paths when local files are cited

## What To Avoid

- giant source dumps with no ranking
- long essays that hide the actual decision-changing findings
- saved briefs for narrow, disposable questions that should have stayed
  ephemeral
- fake certainty when sources disagree
- absolute paths
- implementation plans disguised as research briefs
