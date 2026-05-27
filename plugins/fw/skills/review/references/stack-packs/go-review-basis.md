# Go Review Basis

Use this reference only when the Go stack pack is selected.

## Truth Order

Review Go changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, `go.mod`, Makefile,
   Taskfile, justfile, CI workflows, and any repo lint or test config. This is
   the local truth for format, lint, test, vet, and vulnerability commands.
2. **Current official review guidance:** Go Code Review Comments and Code Review
   Concurrency.
3. **Effective Go as durable baseline:** use it for enduring naming, comments,
   control-flow, and zero-value guidance. The official page notes that it was
   written in 2009 and has not been updated significantly, so do not let it
   override newer official guidance or current module-version behavior.
4. **Go by Example as runnable shape:** use it to check whether an example or
   local pattern matches common Go usage for errors, contexts, goroutines,
   channels, wait groups, HTTP, and testing. Its examples assume the latest
   major Go release, so translate carefully when the module targets an older Go
   version.
5. **The Zen of Go as value lens:** prefer simple packages, low coupling, small
   APIs, explicit failure handling, and code that remains easy to change.
6. **External secondary heuristics:** the Beagle Go review skill is useful for
   checklist coverage and version-gated reminders, but it is not normative over
   repo truth or official Go guidance.

## Touch Grass Before Reviewing

Before making or reporting a Go finding:

- confirm the module Go version from `go.mod`
- confirm how the repo actually runs formatting, linting, testing, vetting, and
  vulnerability scanning
- when the issue is about common usage shape, open the closest matching Go by
  Example page for a concrete example before calling the code unidiomatic
- inspect nearby package code, tests, examples, and CI commands before calling a
  pattern "unidiomatic"
- treat generated files as outputs unless the diff intentionally edits generated
  artifacts

If the repo already defines the truth for `gofmt`, `goimports`, `go test`,
`go vet`, `staticcheck`, `golangci-lint`, or `govulncheck`, follow that truth.

## Version Gates

- **Go < 1.22:** loop-variable capture in goroutines remains a live review
  concern.
- **Go >= 1.18:** `any` exists, but do not demand public-API churn just to swap
  `interface{}` for `any`.
- **Go >= 1.20:** `errors.Join` is available for multi-error aggregation.
- **Go >= 1.21:** `log/slog` exists, but only raise it when structured logging is
  actually in scope and the repo has not standardized elsewhere.

## Strict Review Checklist

### Errors

- errors are handled, propagated, or intentionally ignored with visible reason
- returned errors carry enough context to debug call-site failure
- `errors.Is` and `errors.As` are used instead of brittle string matching
- recoverable failures return errors instead of panicking
- success values are not silently mixed with error returns

### Context and Concurrency

- `context.Context` is the first parameter on request-scoped or cancellable work
- goroutines have a clear exit or cancellation path
- shared state is protected by synchronization or explicit confinement
- channel ownership is clear; sender-side close rules are respected
- concurrency helpers match the module version and real failure-handling needs

### API and Types

- interfaces are minimal and usually owned by the consumer side
- exported names and docs are clear and non-stuttering
- receiver naming and receiver type choices are consistent
- package-level mutable state is justified, not accidental coupling
- zero-value usability is preserved where the type design implies it

### Resource Lifecycle

- files, bodies, and other closers are released on all paths
- `defer` appears immediately after successful acquisition, not before
- cleanup inside loops is intentional and bounded
- retries or retries-after-partial-write do not duplicate side effects

### Tests and Examples

- behavior changes have corresponding `go test` coverage
- concurrency or time-sensitive code has assertions that actually prove the
  synchronization or cancellation behavior
- examples are runnable and reflect the public API when the repo uses examples

## Finding Calibration

- **P1:** unchecked actionable errors, goroutine leaks, unsafe shared state,
  normal-error panics, missing cancellation propagation at a real boundary, or
  resource leaks on shared paths
- **P2:** missing error context, interface or package-shape choices that create
  meaningful coupling, missing tests for changed behavior, or brittle concurrency
  tests
- **P3:** small exported-doc gaps, naming stutter, or straightforward local
  simplifications that do not threaten correctness

## Source Links

- Go Code Review Comments: https://go.dev/wiki/CodeReviewComments
- Go Code Review Concurrency: https://go.dev/wiki/CodeReviewConcurrency
- Effective Go: https://go.dev/doc/effective_go
- Go 1.22 Release Notes: https://go.dev/doc/go1.22
- `errors` package docs: https://pkg.go.dev/errors
- Structured Logging with `slog`: https://go.dev/blog/slog
- Go by Example: https://gobyexample.com/
- The Zen of Go: https://dave.cheney.net/2020/02/23/the-zen-of-go
- Beagle Go review skill:
  https://raw.githubusercontent.com/existential-birds/beagle/refs/heads/main/plugins/beagle-go/skills/go-code-review/SKILL.md
