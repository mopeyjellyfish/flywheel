# Source Ranking And Synthesis

Use this reference when gathering sources, ranking findings, and deciding
whether broad research should stay serial or split into independent threads.

## Search Strategy

- Start wide, then narrow. Use short broad queries or scans first to discover
  the source landscape before drilling into exact terms.
- Match the tool to the source. Prefer specialized connectors or domain tools
  over generic web search when they more directly cover the target corpus.
- Prefer the fastest viable model or harness posture that can still answer the
  question responsibly. Escalate to deeper or slower research only when the
  task is genuinely multi-step, high-value, or high-stakes.

## Source Preference Order

Prefer, in order:

1. current repo truth for repo-grounded claims
2. official or first-party documentation
3. original papers, benchmarks, or standards
4. strong implementation writeups or authoritative secondary analysis
5. weaker commentary only when stronger sources are absent

If a lower-tier source is used because a stronger one is unavailable, say so.

## Ranking Dimensions

Rank findings by these dimensions, in this order:

1. **Relevance** - does this materially change the user's decision?
2. **Source quality** - first-party, original, benchmarked, or weakly sourced?
3. **Freshness** - is there reason the information may have changed recently?
4. **Confidence** - how well do the sources actually support the claim?

Avoid ranking by prose quality or source count alone.

## Thread Design

For broad topics, break research into explicit threads such as:

- definitions and scope
- current best practices
- competing approaches and tradeoffs
- examples or precedents
- failure modes or risks

Prefer 2-5 threads. More than that usually creates synthesis noise unless the
topic is unusually large.

## Facts, Inferences, And Open Questions

Use these labels consistently:

- **Fact** - directly supported by one or more strong sources
- **Inference** - a conclusion drawn from sources but not stated directly by
  them
- **Open Question** - something the current source set does not resolve

Do not hide inferences inside fact language.

## Conflict Handling

When sources disagree:

- name the conflict explicitly
- say which source appears stronger and why
- keep the weaker-but-relevant view visible when it changes the decision
- turn unresolved conflicts into open questions instead of burying them

## Bounded Parallel Research

Parallelize only when the threads are independent enough that each can be
researched and later merged without constant reframing.

Good bounded parallel examples:

- one pass on repo truth and one pass on current published guidance
- one pass on official docs and one pass on academic or benchmark evidence
- one pass on best practices and one pass on examples or precedents

Keep the synthesis step serial and explicit:

- deduplicate overlapping findings
- remove low-value source churn
- preserve conflicts and confidence gaps
- surface only the findings most likely to change the next stage's decisions
- keep worker outputs compact by reference when delegated or orchestrated modes
  are used

## Persistence Guidance

Persist a durable brief when:

- the synthesis is likely to matter again soon
- multiple later stages will reuse it
- the evidence is broad enough that repeating the research would be wasteful

Leave the result ephemeral when:

- the question is narrow and disposable
- the answer depends on one short-lived fact
- the saved artifact would add more upkeep than future leverage
