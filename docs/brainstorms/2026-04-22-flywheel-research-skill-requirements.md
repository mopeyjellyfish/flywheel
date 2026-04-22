---
date: 2026-04-22
topic: flywheel-research-skill
---

# Add A Research Skill To Flywheel

## Problem Frame

Flywheel already does some local repo grounding and selective web research
inside `ideate`, `brainstorm`, and `plan`, but research is not yet a
first-class product surface. The result is inconsistent evidence gathering for
fuzzy work, weak support for current-practice discovery, and no clear reusable
research handoff that makes later ideation or brainstorming smarter.

Flywheel needs an explicit research capability that can be invoked directly and
also activated proactively when the request is broad, unfamiliar, or dependent
on current published information. That capability should gather evidence on the
user's behalf, rank what matters, and feed stronger inputs into later shaping
and planning without turning every task into a heavyweight report.

## Requirements

**Command Surface And Routing**
- R1. Flywheel must provide a user-invokable `flywheel:research` skill for
  topic investigation, evidence gathering, and ranked synthesis.
- R2. `flywheel:start` must be able to route directly to `flywheel:research`
  when the immediate job is to investigate a topic, discover current best
  practices, or gather evidence before requirements or planning.
- R3. Flywheel must not make `research` a mandatory always-visible stage in the
  core `shape -> work -> review -> commit -> spin` loop.
- R4. `ideate`, `brainstorm`, and `plan` must be able to recommend or activate
  research when the request is fuzzy, the domain is unfamiliar, or fresh
  external information would materially improve the outcome.
- R5. When Flywheel activates research proactively rather than from an explicit
  user command, it must say so plainly and explain why the extra research pass
  is warranted.

**Research Intake And Dialogue**
- R6. The research skill must use the host's blocking question tool when a
  clarification would materially improve topic framing, source priority, or
  output usefulness.
- R7. Research intake must stay lightweight: ask only the smallest number of
  clarifying questions needed to narrow scope and choose the search frame.
- R8. When the topic is broad, the skill must help decompose it into explicit
  research dimensions or subquestions before deeper searching begins.
- R9. When the topic is sufficiently clear, Flywheel should research on the
  user's behalf by default rather than stopping to ask whether web searching is
  allowed.
- R10. When the user explicitly opts out of external research or restricts
  source classes, the skill must honor that constraint.

**Research Method And Parallelism**
- R11. The research workflow must distinguish between local repo or
  institutional grounding and external published-source research, using both
  when relevant.
- R12. The skill must break large topics into explicit research threads, such
  as definitions, best practices, competing approaches, risks, and examples,
  rather than using one undifferentiated search pass.
- R13. Flywheel must use parallel agents or parallel tool calls only for
  genuinely independent research threads, and must avoid parallelization when
  the threads depend heavily on shared context or one another.
- R14. The synthesis step must merge thread outputs, remove duplication,
  reconcile conflicts, and surface disagreements or confidence gaps explicitly.
- R15. Flywheel must prefer the simplest research architecture that meets the
  quality bar, with single-agent or lightly orchestrated research as the
  default and heavier multi-agent behavior justified only when topic breadth or
  latency pressure earns it.

**Evidence Quality And Ranking**
- R16. Research output must prefer primary, official, or original sources when
  those exist, especially for technical, academic, product, legal, medical, or
  policy claims.
- R17. The skill must rank collected evidence by relevance, source quality,
  freshness, and confidence rather than presenting a flat source dump.
- R18. Each material claim in the synthesized result must be traceable to
  supporting sources.
- R19. When sources disagree, the output must show the conflict, indicate which
  sources appear stronger, and avoid collapsing uncertainty into false
  certainty.
- R20. The output must distinguish established facts, model inferences, and
  open questions.
- R21. The research product must highlight the findings most likely to change
  ideation, brainstorming, or planning decisions instead of maximizing report
  length.

**Workflow Integration And Reuse**
- R22. `flywheel:ideate` must be able to consume research findings to generate
  a better-grounded shortlist.
- R23. `flywheel:brainstorm` must be able to consume research findings to shape
  requirements, tradeoffs, and success criteria without re-running the full
  research pass unless freshness or scope has changed.
- R24. `flywheel:plan` must be able to reuse prior research findings as an
  input to implementation planning and add targeted follow-up research when
  needed.
- R25. Flywheel must preserve durable research artifacts or summaries when the
  findings are likely to matter beyond the immediate turn, especially for broad
  topic exploration, repeated workflows, or high-value best-practice
  synthesis.
- R26. Flywheel must not force durable artifact creation for every small
  research pass; lightweight ephemeral research should remain acceptable for
  narrow or one-off questions.
- R27. When a durable research artifact exists, later stages should be able to
  find it by topic and reuse it without treating stale material as
  automatically authoritative.
- R28. Durable research outputs must carry enough framing or metadata to make
  freshness, source scope, and intended reuse understandable later.

**Evaluation And Product Quality**
- R29. Flywheel must evaluate the research skill on factual accuracy, citation
  faithfulness, completeness for the asked scope, source quality, and
  efficiency rather than only on prose quality.
- R30. The product should support model tiering: stronger reasoning models for
  orchestration and final synthesis, with smaller or cheaper models used for
  narrower subtasks only when quality remains acceptable.
- R31. Eval coverage must test both direct `flywheel:research` usage and
  proactive research activation inside `start`, `ideate`, `brainstorm`, and
  `plan`.
- R32. The skill must stay stable across Codex, Claude Code, and similar
  hosts, including host-appropriate question tooling and any bounded
  parallel-agent behavior.

## Success Criteria

- Users can explicitly invoke `flywheel:research` to investigate a topic and
  receive a ranked, source-backed synthesis that is useful on its own.
- Flywheel proactively offers or performs research for fuzzy or novelty-heavy
  shaping work instead of pretending repo-only grounding is enough.
- `ideate`, `brainstorm`, and `plan` produce visibly better-grounded outputs
  after research without turning every task into a heavy report-writing pass.
- Research outputs make claims easy to verify and keep uncertainty visible.
- Later shaping passes can reuse durable research when it matters and skip it
  when it does not.

## Scope Boundaries

- Do not add a new mandatory visible `research` stage to the public Flywheel
  backbone.
- Do not force external web research on tasks where repo truth or
  user-supplied context is already sufficient.
- Do not require multi-agent orchestration for every research task.
- Do not treat durable research artifacts as permanent truth; freshness and
  source quality still matter.
- Do not turn the first pass into a full knowledge-base or retrieval-platform
  redesign.

## Key Decisions

- **Make research explicit and proactive:** Flywheel should expose
  `flywheel:research` directly and also use it inside shaping when uncertainty
  or freshness warrants it.
- **Keep the compact loop intact:** research is a helper capability that
  strengthens shaping and planning, not a mandatory backbone stage.
- **Optimize for evidence, not verbosity:** the product should rank and
  synthesize findings so later decisions improve, rather than generate long
  generic reports.
- **Use bounded parallelism:** parallel research is a speed tool for
  independent threads, not a default architecture.
- **Balance persistence with freshness:** preserve reusable research when it
  has ongoing value, but keep small research passes lightweight and ephemeral.

## High-Level Technical Direction

- Recommended direction: introduce a dedicated `skills/research/SKILL.md`
  surface with a standard research brief output that other shaping skills can
  ingest, then wire proactive activation and reuse rules into `start`,
  `ideate`, `brainstorm`, and `plan`.
- Recommended posture: begin with explicit repo or local grounding plus
  external-source research instructions and a clear synthesis contract before
  investing in heavier retrieval or multi-agent infrastructure.

## Dependencies / Assumptions

- Existing Flywheel shaping skills already provide natural integration points
  for research activation and reuse.
- Host question-tool guidance in
  `skills/references/host-interaction-contract.md` remains the cross-platform
  contract for targeted clarification.
- Prompt and workflow eval infrastructure remain the main regression surface
  for research quality.

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R25-R28][Technical] Where should durable research artifacts live,
  and what minimum metadata is required for later reuse and freshness checks?
- [Affects R17-R21][Technical] What exact output schema should represent ranked
  findings, source quality, conflicts, and reusable synthesis cleanly across
  hosts?
- [Affects R29-R31][Technical] Which eval suites should own direct research
  evaluation versus proactive in-stage activation evaluation?
- [Affects R13-R15][Needs research] What practical threshold should trigger
  delegated or parallel research without regressing latency, cost, or synthesis
  quality on smaller topics?

## Next Steps

-> $flywheel:plan for structured implementation planning by default
