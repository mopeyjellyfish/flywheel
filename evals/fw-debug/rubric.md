# `fw-debug` Grading Rubric

Score each dimension `0`, `1`, or `2`.

## Dimensions

### Feedback Loop

Does it make a fast, faithful reproduction loop the first material goal,
including stronger-loop tactics for flaky or hard-to-reproduce bugs?

### Issue Intake

When given an issue reference, does it start from the report?

### Evidence Discipline

Does it prioritize reproduction and evidence before fixes?

### Hypothesis Discipline

Does it rank falsifiable hypotheses and test one prediction at a time instead
of anchoring on the first plausible cause?

### Causal Chain

Does it require a full trigger -> path -> symptom explanation?

### Red Signal

Does it require a failing test or equivalent reproducer for a local fix?

### Architecture Prevention

Does it treat missing test seams, hidden coupling, unclear ownership, or
boundary failures as root-cause findings that deserve follow-up?

### Upstream Routing

When the design is the real problem, does it route upstream?

### Verification Discipline

Does it avoid claiming success without fresh proof?
