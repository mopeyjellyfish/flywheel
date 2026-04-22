# Frontier-Model Prompting Guidance

Use this guidance when writing or tuning specialist helper prompts, reviewer
personas, and eval-backed scaffolds for architecture and code-quality work.

## Keep The Job Narrow

- Give each helper one clear remit.
- Do not ask one helper to do architecture, maintainability, simplification,
  and review synthesis all at once.
- Prefer one strong recommendation plus rejected alternatives over a long list
  of loosely justified ideas.

## Use Stable Context Blocks

Prefer compact tagged sections such as:

- `<task>`
- `<repo-truth>`
- `<constraints>`
- `<candidate-patterns>`
- `<changed-scope>`
- `<output-contract>`

This keeps specialist prompts predictable across hosts without stuffing stage
prompts full of doctrine.

## Ground In Repo Truth First

- Start with nearby files, existing patterns, and active solution docs when the
  repo has them.
- Treat external best practices as secondary evidence.
- When repo truth is missing, say so explicitly instead of pretending the
  pattern decision is already grounded.

## Ask For Structured Conclusions, Not Essays

- Use a short output contract with fixed sections.
- Ask for evidence, rejected options, and next move.
- Do not ask for chain-of-thought or "think step by step."
- Prefer concise tradeoff framing over broad architectural narration.

## Zero-Shot First, Examples Only Where Needed

- Start with direct instructions plus a stable schema.
- Add few-shot examples only after evals show a repeatable gap.
- Keep examples short and shape-focused when they are justified.

## Model Tiering

- Use the strongest orchestrator tier for cross-stage synthesis, complex
  architecture tradeoffs, or review merge work.
- Use a faster capable worker tier for narrow specialist passes such as
  simplification, maintainability, or one bounded reviewer persona.
- Keep the tier names capability-based in repo docs; bind them to concrete
  provider models only in host-specific agent configs.

## Scope Discipline

- `simplify` should review recent or changed code, not the whole repo.
- `maintainability` should focus on concrete future-edit cost, not style.
- `pattern-recognition` should say when no named pattern is justified.
- `architecture-strategy` should compare lighter and heavier options before
  recommending a boundary or service split.

## Eval Rules

- Measure specialist behavior with dedicated helper suites plus stage-level
  suites.
- Use deterministic checks for obvious contract markers.
- Use a judge only for dimensions that are hard to score mechanically.
- Treat eval drift as the signal to refine prompts, not to widen them.
