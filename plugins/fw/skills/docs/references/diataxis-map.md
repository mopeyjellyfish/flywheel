# Diataxis Map

Use this file when deciding what kind of documentation to write or refresh.

## Quadrant Quick Test

| Type | Optimize for | Good fit | Avoid |
| --- | --- | --- | --- |
| **Tutorial** | learning by doing | one guided beginner path to a working outcome | exhaustive options, branching troubleshooting, deep rationale |
| **How-to** | solving a specific problem | targeted steps for a known task | long teaching digressions, full API inventories |
| **Reference** | lookup | commands, flags, config keys, API fields, defaults, behaviors | narrative walkthroughs, persuasive explanation |
| **Explanation** | understanding | rationale, architecture, tradeoffs, mental model | step-by-step instructions, option tables |

## Change-To-Docs Mapping

- **New setup or onboarding flow** -> tutorial + reference
- **CLI command, flag, or workflow change** -> reference; add how-to when the
  task is common enough to deserve a recipe
- **Config or environment variable change** -> reference; add explanation when
  the behavior or tradeoff is non-obvious
- **New user-facing feature flow** -> how-to; add tutorial when a newcomer path
  matters
- **Architecture or behavior rationale change** -> explanation
- **Internal refactor with no reader-visible contract change** -> usually no
  docs update

## Placement Heuristics

1. Prefer the repo's existing docs layout first.
2. If one existing file already owns the topic, update it instead of creating a
   sibling.
3. If the repo has no clear docs structure and multiple new docs are justified,
   use:
   - `docs/tutorials/`
   - `docs/how-to/`
   - `docs/reference/`
   - `docs/explanation/`
4. For a single narrow update, prefer the closest existing entry point such as
   `README.md` or the current topic doc rather than creating new directories.

## Minimum Quality Bar

- commands and examples come from repo truth
- prerequisites are explicit when they matter
- terminology matches the repo's existing language
- each doc stays in one Diataxis lane
- cross-links are light and purposeful
