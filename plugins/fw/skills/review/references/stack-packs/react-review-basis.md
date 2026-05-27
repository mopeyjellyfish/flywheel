# React Review Basis

Use this reference only when the React stack pack is selected.

## Truth Order

Review React changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, package manifest,
   hook lint config, test setup, and framework conventions visible in the repo.
2. **Current React docs:** purity, effects, hooks, and state identity rules.
3. **Hook lint guidance:** `eslint-plugin-react-hooks` is secondary truth when the
   repo uses it.
4. **Framework guidance only when needed:** do not import Next, Remix, Expo, or
   similar assumptions unless the repo clearly uses them.

## Touch Grass Before Reviewing

Before making or reporting a React finding:

- confirm the repo is actually using React, not just JSX syntax
- inspect how hooks are linted and tested locally
- check whether the issue belongs to render, event handling, or effects
- inspect whether state identity is controlled by component position or keys

## Strict Review Checklist

### Purity and Render

- components and hooks do not mutate preexisting objects during render
- render logic depends only on props, state, and context inputs

### Effects and Events

- effects are used only for external synchronization, not for local derivation
- event logic stays in event handlers when no external system is involved
- async effects clean up, cancel, or ignore stale completions correctly

### Hooks

- hooks are called only at the top level of components or custom hooks
- dependency handling does not create stale closures or hidden resubscriptions

### State Identity

- keys and component placement preserve or reset state intentionally
- controlled and uncontrolled boundaries are not mixed accidentally

## Finding Calibration

- **P1:** hook-order violations, stale async state bugs, render-time side effects,
  or wrong state identity across user-visible flows
- **P2:** unnecessary or mis-scoped effects, concrete dependency bugs, or missing
  tests on changed React behavior
- **P3:** local cleanup that makes intent clearer without changing behavior

## Source Links

- Rules of Hooks: https://react.dev/reference/rules/rules-of-hooks
- Keeping Components Pure: https://react.dev/learn/keeping-components-pure
- You Might Not Need an Effect: https://react.dev/learn/you-might-not-need-an-effect
- Preserving and Resetting State:
  https://react.dev/learn/preserving-and-resetting-state
