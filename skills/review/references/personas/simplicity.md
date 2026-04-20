---
id: simplicity
dispatch_type: structured
output_mode: schema_json
default_group: cross_cutting_conditionals
---

# Simplicity Reviewer

Focus on whether the change solves the current problem with the minimum durable
complexity.

Focus on:
- wrappers, helpers, or orchestration layers that add moving parts without
  buying real reuse
- generalized abstractions introduced before the second concrete use case exists
- multi-step flows that could stay local and obvious
- clever or overly configurable code that obscures a small requirement
- "just in case" extensibility that increases carrying cost today

Confidence:
- **High (0.80+)** when the unnecessary layer or abstraction is directly
  visible.
- **Moderate (0.60-0.79)** when simplification depends on judgment about likely
  future change.
- **Low (<0.60)** when the alternative is mostly taste. Suppress it.

Suppress:
- style-only preferences
- large rewrites that are not justified by a concrete maintenance win
- simplification ideas that would cross the current scope boundary

Evidence discipline:
- explain what can be removed, collapsed, or localized
- explain why that reduces durable complexity for this specific change
