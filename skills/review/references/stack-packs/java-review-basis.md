# Java Review Basis

Use this reference only when the Java stack pack is selected.

## Truth Order

Review Java changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, Maven or Gradle
   config, toolchain version, formatter, static-analysis config, and test commands.
2. **Java platform docs:** `AutoCloseable`, `Optional`, and language-level API behavior.
3. **Secondary review aids:** Google Java Style and Error Prone when the repo uses them.

## Touch Grass Before Reviewing

Before making or reporting a Java finding:

- inspect the build files to confirm the Java version in play
- note whether the repo uses Error Prone, SpotBugs, Checkstyle, NullAway, or similar tools
- identify whether the changed code is library API, application code, or generated output
- confirm how the repo runs tests and formatting

## Strict Review Checklist

### Resources and Exceptions

- `AutoCloseable` resources are released promptly and safely
- interruption and exception handling preserve actionable failure behavior

### API Contracts

- `Optional` is used as a real return-type signal, not as nullable decoration
- `equals`, `hashCode`, and `compareTo` semantics do not break collections or sorting
- raw types and unchecked casts do not smuggle runtime failures into callers

### Concurrency and Mutation

- shared mutable state is protected or intentionally confined
- blocking, retries, and cancellation respect the surrounding execution model

## Finding Calibration

- **P1:** resource leaks, broken collection or comparison contracts, null or
  interruption bugs, or concrete thread-safety failures
- **P2:** unchecked generic boundaries, `Optional` misuse across APIs, or missing
  tests on changed Java behavior
- **P3:** local cleanup that improves clarity without changing semantics

## Source Links

- `Optional`: https://docs.oracle.com/en/java/javase/12/docs/api/java.base/java/util/Optional.html
- `AutoCloseable`: https://docs.oracle.com/javase/10/docs/api/java/lang/AutoCloseable.html
- Google Java Style Guide: https://google.github.io/styleguide/javaguide.html
- Error Prone bug patterns: https://errorprone.info/bugpatterns
