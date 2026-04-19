# Optimization Loop

Use this loop unless there is a single already-proven hotspot with one obvious
fix.

## The Loop

1. **Baseline**
   - capture the metric and guardrails before edits

2. **Hypothesis**
   - one sentence:
     - what is expensive
     - why
     - what change should move the metric

3. **Smallest credible change**
   - one change set that can plausibly test the hypothesis

4. **Correctness gate**
   - run the relevant tests and validation before trusting the metric move

5. **Measurement**
   - re-run the same local or remote measurement path

6. **Decision**
   - keep
   - revert
   - revise the hypothesis

## Serial First

Prefer serial optimization until:

- the baseline is stable
- the measurement harness is trusted
- the hotspots are clearly independent

## Keep / Revert Rules

Keep a change only when:

- the primary metric improved enough to matter
- guardrails held
- the explanation is coherent

Revert or isolate further when:

- the metric moved but guardrails regressed
- the result is noisy or irreproducible
- the change bundle is too large to attribute

## Shipping

Optimization changes still go through the normal Flywheel closeout:

- `/fw:review` for risk finding
- `/fw:ship` for commit, push, PR, and monitoring notes
- `/fw:spin` when the lesson is durable
