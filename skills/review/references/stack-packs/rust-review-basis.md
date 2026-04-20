# Rust Review Basis

Use this reference only when the Rust stack pack is selected.

## Truth Order

Review Rust changes in this order:

1. **Repo truth first:** nearest `AGENTS.md` or `CLAUDE.md`, `Cargo.toml`,
   workspace config, toolchain file, lint config, and test commands.
2. **The Rust Book:** ownership, borrowing, and `Result`-driven error handling.
3. **Rust API Guidelines:** public crate design, common trait support, and caller control.
4. **Clippy:** secondary truth for correctness and maintainability checks when the repo uses it.

## Touch Grass Before Reviewing

Before making or reporting a Rust finding:

- read `Cargo.toml` and note edition, features, and MSRV or toolchain pins when visible
- distinguish library code from binary, example, benchmark, or test code
- inspect `unsafe` blocks and their surrounding invariants before making claims
- confirm how the repo actually runs `cargo test`, `clippy`, and formatting

## Strict Review Checklist

### Ownership and Allocation

- ownership and borrowing choices avoid unnecessary clones, aliasing bugs, and
  hidden allocations
- caller control is preserved where the API can avoid duplicate work or copies

### Error Handling

- recoverable failures return `Result` instead of panicking
- propagated errors carry enough context for callers to act

### API Shape

- public types implement common traits and standard conversions when appropriate
- trait, generic, and newtype choices improve interoperability rather than hiding state

### Safety and Concurrency

- `unsafe` blocks have clear invariants and do not violate aliasing or lifetime rules
- `Send`, `Sync`, locking, and async boundaries match actual executor and thread assumptions

## Finding Calibration

- **P1:** concrete panic or safety hazards, broken ownership assumptions, or
  async or concurrency bugs likely in normal use
- **P2:** missing error context, caller-hostile APIs, or missing tests around
  changed ownership or async behavior
- **P3:** local simplifications or API polish that do not threaten correctness

## Source Links

- Ownership: https://doc.rust-lang.org/book/ch04-01-what-is-ownership.html
- Recoverable errors and `Result`:
  https://doc.rust-lang.org/book/ch09-02-recoverable-errors-with-result.html
- Rust API Guidelines: https://rust-lang.github.io/api-guidelines/checklist.html
- Clippy: https://rust-lang.github.io/rust-clippy/master/index.html
