# Research Activation Heuristics

Use this reference to decide when Flywheel should invoke `research`, when a
stage should reuse an existing brief, and when external research should stay
off.

## General Rule

Use `research` when better evidence would materially improve the next shaping
artifact.

Ask:

1. Is the topic broad, current-practice-sensitive, or unfamiliar enough that
   repo truth alone is weak?
2. Is the immediate need evidence gathering rather than idea selection,
   requirements shaping, or implementation planning?
3. Would a compact recommendation-bearing handback materially improve the next
   stage, and would a reusable brief likely compound into later `ideate`,
   `brainstorm`, `review`, or `plan` work?

If the answer to those questions is mostly no, stay in the stage already in
focus and avoid extra research ceremony.

## Research Execution Modes

Choose the simplest mode that can answer responsibly:

- **Inline** - one agent researches directly. Use for narrow questions, one
  repo area, one source family, or one obviously bounded thread. This is the
  fastest and most efficient default.
- **Delegated** - a shaping agent hands a bounded research task to a dedicated
  researcher and continues once the brief comes back. Use when `ideate`,
  `brainstorm`, or `plan` is still the main artifact but carrying the search
  state inside that stage would degrade quality or clarity.
- **Orchestrated** - a lead researcher decomposes the topic into 2-5
  independent threads, assigns bounded worker passes, and synthesizes their
  findings serially. Use only for breadth-first, high-value topics where the
  threads are truly independent and the host supports the needed delegation.

Prefer `inline` first. Escalate only when breadth, independence of threads, or
latency pressure justifies the extra cost and coordination.

## Direct `research`

Use when the immediate job is:

- investigate a topic before choosing a direction
- gather current best practices or published guidance
- compare approaches before writing requirements or a plan
- collect evidence that multiple shaping stages will likely reuse
- answer "research this topic" or equivalent direct asks

Default output: a compact in-turn brief with ranked findings, visible
uncertainty, and a recommendation. Save a durable brief only when the topic is
broad enough or reusable enough to warrant it.

Strong signals:

- "Research how frontier models should do X"
- "Find the current best practices before we design this"
- "Gather published guidance on this topic"
- "Make ideate and brainstorm smarter with research first"

Suppress when:

- the user really wants idea generation, requirements shaping, or a technical
  execution plan and the evidence gap is minor
- repo-local patterns already answer the question cleanly
- the work is ready for implementation and the missing knowledge is small

## Stage-Level Activation

### `start`

Route directly to `research` when topic investigation or current-practice
discovery is the earliest missing stage.

Suppress when the real artifact is clearly:

- a shortlist (`ideate`)
- a requirements doc (`brainstorm`)
- an implementation plan (`plan`)

### `ideate`

Activate research when:

- external signals would materially improve which ideas survive
- the topic is outside this repo but still software **and** the answer would be
  weak without current external guidance
- the repo lacks strong local patterns for the subject
- freshness matters more than local precedent

Prefer reuse over rerun when a matching fresh brief already exists.

### `brainstorm`

Activate research when:

- the chosen direction is still fuzzy because current practice is unclear
- the user explicitly mentions researching the topic
- published guidance is likely to change requirements, tradeoffs, or success
  criteria

Keep the requirements artifact primary. Research should sharpen the brainstorm,
not replace it.

### `plan`

Activate research when:

- the codebase lacks strong direct local patterns
- the plan touches unfamiliar external APIs, standards, or current best
  practices
- a saved brief exists but needs targeted follow-up on one open thread

Keep the plan primary. Research should improve implementation decisions, not
turn planning into report writing.

## Search Strategy Heuristics

- Start with short, broad queries or scans to map the landscape.
- Narrow only after the first pass reveals the likely source clusters.
- Prefer the fastest viable model and tool posture that can still answer
  responsibly.
- Escalate to deeper, slower, or multi-agent research only for multi-step,
  high-value, or high-stakes questions.

## Persistence Heuristics

The default research outcome is an ephemeral handback. It should usually carry:

- key ranked findings
- the source posture and uncertainty that materially affect trust
- a clear recommendation for the caller or user
- explicit save-or-skip guidance

Write a durable brief under `docs/research/` when:

- the topic is broad enough to benefit future shaping work
- later stages are likely to reuse the findings
- the user asked for a saved research artifact
- the findings capture best-practice guidance worth preserving in this repo

Prefer ephemeral inline output when:

- the question is narrow and one-off
- the answer will likely go stale before reuse
- the repo already has a strong durable brief for the same topic
- the main value is helping the current caller choose a direction now

## Parallel Research Heuristics

Bounded parallel research is justified only when:

- the topic decomposes into truly independent threads
- those threads do not require constant shared-context reconciliation
- the host supports the needed delegation or parallel tool behavior
- latency pressure or topic breadth makes the coordination cost worthwhile

Good parallel candidates:

- definitions vs best practices vs examples
- official docs vs academic literature vs implementation precedents
- repo grounding vs external published guidance

Poor parallel candidates:

- one narrow question with one likely source family
- topics where each thread changes the framing of the next
- small tasks where merge overhead dominates the research itself

## Anti-Patterns

- Do not treat `research` as a mandatory stage before all shaping work.
- Do not rerun broad external research when one targeted follow-up would do.
- Do not save every small research pass into `docs/research/`.
- Do not use multi-agent research by default just because the topic sounds big.
- Do not flatten weak inferences into facts because the output needs a strong
  recommendation.
