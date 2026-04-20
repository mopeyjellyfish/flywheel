# Zig Review Basis

Use this reference only when the Zig stack pack is selected.

## Truth Order

Review Zig changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, `build.zig`,
   `build.zig.zon`, target definitions, and test or format commands.
2. **Official Zig documentation:** memory, error handling, testing, and version-specific language behavior.
3. **Stdlib patterns:** use existing standard-library style in the repo when the
   project already follows it.

## Touch Grass Before Reviewing

Before making or reporting a Zig finding:

- inspect the build files and use docs that match the pinned Zig version when possible
- identify the allocator ownership policy used in the changed code
- confirm how the repo runs `zig test` and `zig fmt`
- inspect error paths, not just the happy path, before judging cleanup

## Strict Review Checklist

### Memory and Cleanup

- allocations have a visible owner and matching cleanup
- `defer` and `errdefer` are placed so success and failure both release resources correctly

### Errors and Explicitness

- recoverable failures use error unions and `try` or `catch` rather than silent assumptions
- `unreachable` and panic-like behavior are reserved for truly impossible states

### Pointers and Casts

- slices, sentinels, pointers, and alignment assumptions are visible and correct
- integer casts, truncation, and pointer conversions do not silently lose data

### Tests

- allocator-sensitive code is covered with leak-detecting tests when practical
- error-path behavior is exercised when the diff changes cleanup or allocation

## Finding Calibration

- **P1:** concrete leak, cleanup slip, wrong error-path behavior, or pointer or cast bug
- **P2:** missing allocator discipline around changed behavior, or missing tests on
  failure paths
- **P3:** local simplification that clarifies ownership or explicitness

## Source Links

- Zig documentation: https://ziglang.org/documentation/master/
- Zig getting started and versioned docs guidance:
  https://ziglang.org/learn/getting-started/
