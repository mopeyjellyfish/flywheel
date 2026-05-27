# Scenario Shape

Choose the smallest scenario set that can honestly prove the change:

- **Smoke**
  - use when the question is basic viability
  - load the page, confirm the key surface appears, check for obvious console or
    request failures

- **Changed happy path**
  - use when a feature or UI behavior changed
  - exercise the exact behavior the branch claims to modify

- **Regression reproduction**
  - use when fixing a bug or validating a risky interaction
  - first reproduce the failing behavior, then rerun after the fix

- Freeform path
  - use only when repo context or user direction clearly requires a different
    scenario shape

Avoid large scripted suites unless the repo already has them and they are the
honest proof surface.
