# Brainstorm Output Examples

Load this file only when taking the clear-requirements fast path, preparing the
synthesis checkpoint, structuring approach comparisons, drafting the
requirements document, or repairing output that is drifting from the expected
shape.

These examples show **shape**, not domain. Keep the structure tight and adapt
the content to the actual repo and user request.

## Example: Synthesis Checkpoint

Use this before moving into Phase 2 or Phase 3.

```text
Current read:
- Problem frame: New users abandon signup when optional profile setup appears before account creation.
- Target user: First-time self-serve users on the web signup flow.
- In scope: Reordering signup so account creation completes before optional profile enrichment.
- Out of scope: Reworking profile fields, onboarding copy overhaul, or mobile app signup.
- Success criteria: Users can create an account in one uninterrupted step and optional profile setup happens afterward.
- Unresolved product decisions: Whether optional profile setup should appear immediately after signup or be deferred to the dashboard.
```

If any line above is still fuzzy, ask one more question before continuing.

## Example: Approach Comparison

Use a consistent mini-schema when multiple viable directions remain.

```markdown
**Approach:** Inline post-signup prompt
- **Shape:** Complete account creation first, then show profile enrichment in a lightweight modal or interstitial.
- **Optimizes for:** Fastest path to first success with minimal navigation change.
- **Main risk:** The follow-up prompt may still feel interruptive if it appears immediately.
- **Best when:** The team wants a small workflow change without redesigning onboarding.

**Approach:** Deferred onboarding checklist
- **Shape:** Complete account creation, land the user in the product, and show profile completion as a checklist item in the dashboard.
- **Optimizes for:** Lowest signup friction and clearer separation between signup and onboarding.
- **Main risk:** Fewer users may complete their profile without an immediate prompt.
- **Best when:** Reducing abandonment matters more than early profile completeness.
```

## Example: Lightweight Requirements Doc

Use this shape for small but durable software decisions.

```markdown
---
date: 2026-04-18
topic: post-signup-profile-step
---

# Move Profile Setup After Signup

## Problem Frame
New users hit optional profile setup before their account is created, which adds friction to first-time signup.

## Requirements
- R1. Account creation must complete before any optional profile setup appears.
- R2. Optional profile setup must remain available immediately after signup.
- R3. Existing successful signup behavior for users who skip profile setup must remain intact.

## Success Criteria
- Users can create an account without encountering optional profile questions first.
- The product still offers profile completion immediately after signup.

## Scope Boundaries
- Profile field definitions are unchanged.
- Mobile signup is unchanged.

## Key Decisions
- Post-signup profile setup will remain in the web flow rather than moving to a later lifecycle stage.

## Next Steps
-> $flywheel:plan for structured implementation planning
```

## Example: Standard Requirements Doc

Use this shape when the brainstorm resolves most product decisions but still
needs one cleanly labeled blocker.

```markdown
---
date: 2026-04-18
topic: notification-digest-controls
---

# Add User Controls for Notification Digests

## Problem Frame
Users receive digest emails on a fixed cadence today and cannot choose frequency or opt out without disabling all email notifications.

## Requirements

**User Controls**
- R1. Users must be able to choose daily, weekly, or off for digest emails.
- R2. Digest controls must be separate from transactional email settings.

**Behavior**
- R3. The selected digest frequency must apply to future digests only.
- R4. Turning digests off must stop future digest sends without affecting other email categories.

## Success Criteria
- Users can find and change digest frequency without contacting support.
- Digest changes take effect for future sends only.

## Scope Boundaries
- Digest content generation is unchanged.
- Transactional email preferences are unchanged.

## Key Decisions
- Digest frequency belongs in notification settings, not inside individual digest emails.

## Dependencies / Assumptions
- Existing notification settings already provide a user-facing home for additional preference controls.

## Outstanding Questions

### Resolve Before Planning
- [Affects R1][User decision] Should the default for existing users remain weekly, or should they be prompted to choose a frequency?

### Deferred to Planning
- [Affects R3][Technical] How should scheduled-but-not-yet-sent digests behave when a user changes frequency close to send time?

## Next Steps
-> Resume $flywheel:brainstorm to resolve blocking questions before planning
```
