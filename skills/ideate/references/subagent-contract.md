# Ideation Subagent Contract

Read this file only when delegated grounding or delegated ideation was chosen.

The goal is consistency across models and hosts. Each delegated subtask should
have one job, one input envelope, and one return shape.

## Delegation Rule

Do not delegate by default. Use this contract only after the main skill has
already decided that delegation is warranted.

## Ideation Subtasks

Each ideation subtask owns one starting frame only. It generates raw
candidates. It does not critique, rank, or decide survivors.

### Input Envelope

Pass the task using these tags:

```xml
<ideation_task>
  <focus_hint>...</focus_hint>
  <grounding_summary>...</grounding_summary>
  <generation_frame>pain-and-friction</generation_frame>
  <generation_requirements>
    Generate 5-8 raw candidates unless the caller narrowed the count.
    Generate raw candidates only.
    Do not critique, rank, or merge.
    Prefer grounded, specific ideas over abstract themes.
    Avoid near-duplicates of obvious defaults unless the grounding strongly
    supports them.
  </generation_requirements>
</ideation_task>
```

### Required Output

Return exactly one tagged batch and nothing else:

```xml
<ideation_batch frame="pain-and-friction">
  <idea>
    <title>...</title>
    <summary>...</summary>
    <why_it_matters>...</why_it_matters>
    <grounding>...</grounding>
    <complexity>low</complexity>
  </idea>
</ideation_batch>
```

Rules:

- `frame` must match the assigned frame
- each `<idea>` must include every required field
- `complexity` must be one of `low`, `medium`, or `high`
- do not add narrative before or after the tagged block

If the grounding is thin, still return the best candidates you can, but make
the uncertainty visible inside `<grounding>`.

## Grounding Subtasks

When grounding is delegated, each subtask should return exactly one tagged
block such as:

```xml
<grounding_slice type="external_context">...</grounding_slice>
```

Use one `type` from this set:

- `codebase_context`
- `topic_context`
- `existing_artifacts`
- `issue_themes`
- `external_context`

## Coalescing Rules

After delegated ideation returns:

1. concatenate all `<idea>` items
2. dedupe by normalized intent, not title alone
3. keep the strongest grounding statement when duplicates overlap
4. preserve a small number of strong cross-frame combinations
5. wrap the merged set in `<raw_candidates>`

The orchestrator owns filtering, ranking, and handoff.
