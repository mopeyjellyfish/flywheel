# Implementation Unit Examples

Load this file only when drafting implementation units, choosing test posture,
or repairing output that is drifting from the required unit schema.

These examples are about **shape**, not domain. Reuse the structure and field
semantics. Adapt the file paths, patterns, and proof points to the actual repo.

`Execution mode` signals whether `$fw:work` may treat a unit as
`parallel-ready` after dependencies resolve. It is still subject to a fresh
shared-write safety check during execution.

## Example: `tdd`

Use this shape when the unit changes externally observable behavior and the
surface is already testable.

```markdown
- [ ] **Unit 2: Reject duplicate emails during signup**

**Goal:** Prevent duplicate-email account creation without changing the success
response for unique emails.

**Requirements:** [R1, R3]

**Dependencies:** Unit 1

**Execution mode:** `parallel-ready` -- After Unit 1 establishes the shared
validation seam, this unit stays within one service/controller/test cluster and
can run alongside other non-overlapping follow-up units.

**Files:**
- Modify: `src/services/signup.ts`
- Modify: `src/http/signup-controller.ts`
- Test: `test/services/signup.test.ts`
- Test: `test/http/signup-controller.test.ts`

**Test posture:** `tdd` -- This changes user-visible behavior at a service and
HTTP boundary that is already easy to exercise with existing tests.

**Approach:**
- Reuse the existing signup validation flow and reject duplicates before
  persistence.
- Preserve the current success payload and controller wiring.

**Execution note:** none

**Patterns to follow:**
- `src/services/password-reset.ts`
- `test/http/password-reset-controller.test.ts`

**Test scenarios:**
- Duplicate email returns the expected validation error and does not create a
  user.
- Unique email still creates the account successfully.
- Existing success response shape remains unchanged.

**Red signal:** `test/http/signup-controller.test.ts` fails on
`rejects duplicate email with 409`.

**Green signal:** That test passes, and
`test/services/signup.test.ts` proves no user record is created for duplicates.

**Verification:**
- none
```

## Example: `characterization`

Use this shape when the first job is to pin current behavior in a fragile or
poorly understood area before changing it.

```markdown
- [ ] **Unit 1: Pin current CSV normalization behavior**

**Goal:** Capture current normalization behavior for malformed CSV rows before
changing the importer.

**Requirements:** [R2]

**Dependencies:** None

**Execution mode:** `serial` -- This unit establishes the current-behavior
baseline that later follow-up units should trust before making changes.

**Files:**
- Test: `test/import/csv-normalizer.test.ts`

**Test posture:** `characterization` -- The importer is legacy and brittle, so
the first useful move is to lock current behavior before redesigning it.

**Approach:**
- Add focused characterization coverage around the malformed-row cases that the
  follow-up change will touch.
- Preserve current output exactly in this unit.

**Execution note:** none

**Patterns to follow:**
- `test/import/xml-normalizer.test.ts`

**Test scenarios:**
- Missing optional columns are normalized to the current default output.
- Blank rows are skipped the way the importer currently skips them.
- Existing malformed-row handling is captured without changing runtime code.

**Red signal:** `n/a -- the first move is adding characterization coverage for
current behavior, not starting from a failing behavior-change test`

**Green signal:** `n/a -- this unit does not change runtime behavior`

**Verification:**
- `test/import/csv-normalizer.test.ts` passes and would fail if the current
  normalization behavior drifted unexpectedly in later units.
```

## Example: `no-new-tests`

Use this shape only when new tests would be disproportionate to the unit.

```markdown
- [ ] **Unit 3: Align environment variable names across deployment manifests**

**Goal:** Rename the deployment environment variable consistently across config
artifacts without changing application logic.

**Requirements:** [R4]

**Dependencies:** Unit 2

**Execution mode:** `parallel-ready` -- Once Unit 2 lands, this manifest-only
rename can be handled independently from other non-overlapping cleanup units.

**Files:**
- Modify: `deploy/kubernetes/api-deployment.yaml`
- Modify: `deploy/kubernetes/worker-deployment.yaml`
- Modify: `config/env.example`

**Test posture:** `no-new-tests` -- This is a configuration-only rename across
deployment artifacts with no direct in-repo behavioral surface worth testing.

**Approach:**
- Rename the variable consistently across manifests and the checked-in example
  env file.
- Preserve the existing value flow and comments.

**Execution note:** none

**Patterns to follow:**
- `deploy/kubernetes/web-deployment.yaml`

**Test scenarios:**
- `n/a -- configuration-only unit with no direct feature behavior to enumerate`

**Red signal:** `n/a -- no new failing test is proportionate for this unit`

**Green signal:** `n/a -- completion is based on configuration consistency, not
on a new test transition`

**Verification:**
- All touched manifests and checked-in env references use the same variable
  name with no stale references left behind.
```

## Example: Architecture-Bearing Execution Note

Use this add-on shape when a unit must preserve an earlier architecture or
pattern decision.

```markdown
**Execution note:** Preserve the ports/adapters boundary from the plan: keep
DTO mapping at the transport edge and do not let repository or transport types
leak into domain rules.
```
