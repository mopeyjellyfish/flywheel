# TypeScript Review Basis

Use this reference only when the TypeScript stack pack is selected.

## Truth Order

Review TypeScript changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, the effective
   `tsconfig` chain, lint config, build config, test setup, and package
   boundaries.
2. **Current TypeScript docs:** compiler strictness, control-flow narrowing,
   module behavior, and release-note features actually in play.
3. **Type-aware lint guidance:** `typescript-eslint` is secondary truth for
   promise handling and unsafe escapes when the repo uses it.
4. **Runtime truth:** validation, serialization, or transport contracts win over
   purely compile-time optimism.

## Touch Grass Before Reviewing

Before making or reporting a TypeScript finding:

- read the nearest `tsconfig` and any `extends` chain you can resolve locally
- note `strict`, `strictNullChecks`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`, module mode, and JSX mode when visible
- confirm how the repo actually runs `tsc`, linting, and tests
- inspect the runtime boundary before calling a type-safe surface "safe"
- treat generated `.d.ts` files and codegen outputs as outputs unless the diff
  intentionally edits them

## Strict Review Checklist

### Type Soundness

- unsafe `any`, `unknown`, assertions, or non-null escapes do not leak into real
  call sites
- narrowing and discriminated unions are exhaustive where the code depends on it
- optional and index access behavior matches the repo's strictness posture

### Async and Effects

- promise-returning work is handled, awaited, returned, or intentionally floated
- concurrency helpers are used where order or failure aggregation matters
- async setup does not hide races or dropped rejections

### API and Module Boundaries

- exported types describe stable contracts rather than incidental implementation
- value imports are not retained when a type-only import is the correct shape
- declaration surfaces match runtime behavior

### Runtime Boundaries

- parsing, JSON, env, storage, and network inputs are validated or narrowed
- caller-visible types do not promise more than the runtime can enforce

## Finding Calibration

- **P1:** clear unsoundness across a runtime boundary, dropped promise failure, or
  exported contract drift likely to break callers
- **P2:** incomplete narrowing, over-widened contracts, or missing type-aware
  tests on changed behavior
- **P3:** straightforward module-shape cleanup or local type simplification

## Source Links

- TSConfig `strict`: https://www.typescriptlang.org/tsconfig/strict.html
- Narrowing: https://www.typescriptlang.org/docs/handbook/2/narrowing.html
- Type-only imports and exports:
  https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html
- `no-floating-promises`:
  https://typescript-eslint.io/rules/no-floating-promises/
