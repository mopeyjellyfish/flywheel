# Evidence Contract

Capture only the artifacts that materially help downstream review or shipping.

Default posture:

- prefer sanitized visual proof first
- keep the evidence set minimal unless a failure demands more
- keep sensitive artifacts local
- allow payload or trace evidence only when you are highly confident it is
  clean
- never paste raw secrets or unredacted sensitive payloads into reports or PRs
- prefer redacted or dummy-substituted examples over withholding the useful
  signal entirely when raw artifacts are too sensitive

Default evidence set:

- one snapshot near the start
- one snapshot or screenshot after the changed behavior succeeds

Add more only when needed:

- **Screenshot** for visible UI proof or visual regressions
- **Console** when client-side errors or warnings matter
- **Network** when failed requests, status codes, or missing assets matter
- **Trace** when behavior is flaky, timing-sensitive, or hard to explain

Sensitive-data rules:

- do not retain or share auth headers, cookies, bearer tokens, CSRF tokens,
  session identifiers, passwords, or raw credential material
- payloads or response bodies may be shared only when you are above 90%
  confident they contain no secrets and no meaningful PII
- when network or trace capture is needed, summarize the failure and redact the
  artifact before passing it downstream; use dummy stand-in values when that
  preserves the structure more clearly
- for PRs, link or describe sanitized evidence only; do not paste raw network
  dumps or trace payloads unless they pass the same confidence gate

Prefer saving evidence under:

```text
.context/flywheel/browser/<run-id>/
```

If the repo or host already has a better local artifact convention, use that
instead and name it clearly in the output.
