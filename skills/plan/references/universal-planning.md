# Universal Planning Workflow

This file is loaded when `$fw:plan` detects a non-software planning task. It
replaces the software-specific phases with a domain-agnostic planning workflow.

## Before Starting: Verify Classification

Confirm the task is actually non-software before proceeding:

- if it is really a software task, return to the main `$fw:plan` workflow
- if it is a quick-help request rather than a planning task, respond directly
- in automated software-only pipelines, say plainly that the pipeline expects
  software work and stop

## Step 1: Assess Ambiguity and Research Need

Evaluate two things before planning:

### Would 1-3 quick questions materially improve the plan?

- **Default:** ask 1-3 questions when the answers would change the structure or
  content
- **Skip questions entirely** only when the request already specifies the major
  variables or the task is simple enough that reasonable assumptions cover it

Always include a final option such as:

`Skip — just make the plan with reasonable assumptions`

### Does the plan depend on current facts?

| Research need | Signals | Action |
|--------------|---------|--------|
| None | Generic, timeless, or conceptual plan | Skip research and build from general knowledge |
| Recommended | Specific locations, venues, dates, prices, schedules, seasonal availability, or recent events | Research before planning |

When research is recommended, do it rather than merely offering it. Stale
recommendations are worse than none.

## Step 1b: Focused Q&A

Ask up to 3 targeted questions by calling the exact host question tool named in
the host interaction contract when that tool is available.

Ask informed questions, not blank extraction prompts. Offer choices when
possible. Use multi-select only when it genuinely helps.

## Step 2: Structure the Plan

Do **not** use the software plan template for non-software tasks.

### Choose the Right Output Shape

| Task type | Best format | Why |
|-----------|-------------|-----|
| High personal preference | Curated options per category | Preferences vary; options are better than one forced answer |
| Logical sequence | Single prescriptive path | Sequencing matters |
| Hybrid | Fixed structure with choice points | Some parts are fixed, some should remain flexible |

### Formatting Guidance

- prefer bullets and tables for actionable content
- use prose only for rationale and connective tissue
- plans are for scanning and executing, not reading cover-to-cover

### Quality Principles

- actionable steps
- sequenced by dependency
- time-aware when relevant
- resource-identified
- contingency-aware
- appropriately detailed
- domain-appropriate format

## Step 3: Save or Share

After structuring the plan, ask how the user wants to receive it.

**Question:** "Plan ready. How would you like to receive it?"

Options:

1. **Save to disk**
   - `docs/plans/` if it exists
   - current working directory
   - `/tmp`
   - a custom path
   - filename convention: `YYYY-MM-DD-<descriptive-name>-plan.md`
   - use a `# Title` heading and `Created: YYYY-MM-DD` instead of YAML
     frontmatter
2. **Open in Proof (web app) — review and comment to iterate with the agent**
   - only when the proof skill or equivalent exists
3. **Save to disk AND open in Proof**
   - only when the proof skill or equivalent exists

Do not offer `$fw:work` for non-software plans.
