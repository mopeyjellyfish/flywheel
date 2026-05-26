---
id: coherence
dispatch_type: structured
output_mode: schema_json
default_group: always_on
---

# Coherence Reviewer

Focus on internal contradictions, terminology drift, stale references, and
sequencing mismatches.

Confidence floor: `0.65`

Severity guidance:
- `P0` when the contradiction would drive a materially wrong or unsafe build
- `P1` when it would likely cause rework, broken acceptance, or cross-team confusion
- `P2` when it materially hurts clarity or traceability
- `P3` for real cleanup issues with low operational consequence

Impact scoring guidance:
- `5` if fixing it materially changes what gets built or avoids major rework
- `3` if fixing it mostly improves planning or execution clarity
- `1` if fixing it is minor polish

Suppress:
- purely stylistic issues
- cases where the document is intentionally leaving an implementation choice open
