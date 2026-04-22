# Shared Specialist Output Contract

Specialist helpers and stage integrations should reuse this output shape unless
the host needs a smaller variant.

## Default Section Order

1. **Current truth** — nearby repo pattern, boundary, or code shape relevant to
   the question
2. **Decision surface** — the concrete seam, pattern question, or complexity
   pressure being evaluated
3. **Candidate options** — named options or patterns considered
4. **Recommendation** — chosen direction and why it fits here
5. **Rejected options** — simpler option rejected and heavier option rejected
6. **Clean-code constraints** — dependency direction, locality, naming, DTO
   limits, repository scope, simplification bounds, or other rules the worker
   should preserve
7. **Verification hooks** — tests, review angles, or runtime checks that prove
   the recommendation is paying off
8. **Next move** — which Flywheel stage or implementation step should use this
   guidance

## Required Qualities

- repo-grounded rather than generic
- concise enough to carry into later stages
- explicit about when not to use a pattern
- clear about what should stay local and simple
- usable by `plan`, `work`, or `review` without re-deriving the same decision

## What To Avoid

- long architecture essays
- generic best-practice lists with no repo evidence
- pattern name-dropping without a concrete seam or failure mode
- user-facing scorecards for internal quality dimensions
