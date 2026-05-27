# Visual Communication in Plan Documents

Section 3.4 of `$fw:plan` covers diagrams about the *solution being planned*.
This guidance covers a different concern: visual aids that help readers
*navigate and comprehend the plan document itself* — dependency graphs,
interaction diagrams, and comparison tables.

Visual aids are conditional on content patterns, not on plan depth.

## When to Include

| Plan describes... | Visual aid | Placement |
|---|---|---|
| 4+ implementation units with non-linear dependencies or 2+ parallel-ready sibling groups | Mermaid dependency graph | Before or after `## Implementation Units` |
| `System-Wide Impact` naming 3+ interacting surfaces or cross-layer effects | Mermaid interaction or component diagram | Within `System-Wide Impact` |
| `Overview` or `Problem Frame` involving 3+ behavioral modes, states, or variants | Markdown comparison table | Within `Overview` or `Problem Frame` |
| `Key Technical Decisions` or `Alternative Approaches` with 3+ interacting decisions or alternatives | Markdown comparison table | Within the relevant section |

## When to Skip

- the plan has 3 or fewer units in a straight dependency chain with no
  parallel-ready sibling sets
- prose already communicates the relationships clearly
- the visual would duplicate what `High-Level Technical Design` already shows
- the visual describes code-level detail rather than plan structure

## Format Selection

- **Mermaid** (default) for dependency graphs and interaction diagrams
- **ASCII or box-drawing diagrams** for annotated flows that need rich in-box
  content
- **Markdown tables** for mode, variant, decision, or approach comparisons

Guidelines:

- use `TB` direction for Mermaid so diagrams stay narrow
- keep diagrams proportionate to the plan
- place visuals inline at the point of relevance
- keep visuals at the plan-structure level, not code-structure level
- prose is authoritative when a visual and prose disagree

After generating a visual aid, verify it accurately represents the plan
sections it illustrates.
