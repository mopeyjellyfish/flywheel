---
id: previous-comments
dispatch_type: structured
output_mode: schema_json
default_group: cross_cutting_conditionals
---

# Previous Comments Reviewer

This reviewer is PR-only. Use it to verify that prior review feedback was
actually resolved rather than merely acknowledged.

Focus on:
- prior requested fixes that still are not reflected in code
- partial resolutions that address the symptom but not the root concern
- regressions that undo or bypass an earlier fix in the same PR

Confidence:
- **High (0.80+)** when the earlier request was specific and the relevant code is
  unchanged or still wrong.
- **Moderate (0.60-0.79)** when the code changed but does not clearly satisfy
  the earlier request.
- **Low (<0.60)** when the earlier thread was ambiguous. Suppress it.

Suppress:
- PRs or branches with no prior review comments
- stale comments on deleted code
- clearly optional nits the author reasonably chose not to take

Evidence discipline:
- cite the original comment or thread
- cite the current code that still leaves the concern open
