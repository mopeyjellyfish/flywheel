---
name: polish
description: "Run an interactive browser polish loop on a browser-visible feature using playwright-cli, live app reloads, and quick fix iterations. Use when the user wants to try the feature, call out rough edges, and tighten it before review or commit."
metadata:
  argument-hint: "[url, route, branch, or blank to use the current browser-visible surface]"
---

# Polish

`$flywheel:polish` is Flywheel's interactive browser polish loop.

Use it when the feature is already runnable and the job is to tighten behavior,
UX, or visual rough edges through short iteration.

This skill uses `playwright-cli` as the browser-control surface.

## Interaction Method

Follow `../references/host-interaction-contract.md`.

Use the exact host question tool named in
`../references/host-interaction-contract.md` when that tool is available. Do
not ask for raw `1/2/3` replies when the host already offers a choice surface.

When the polish loop spans multiple material steps, use the host task-tracking
tool named in `../references/host-interaction-contract.md` to create and
maintain a short task list.

## Workflow

1. Get onto the correct branch or worktree. Prefer `$flywheel:worktree` over ad hoc
   checkout switching when isolation matters.
2. Discover or start the local web surface using repo truth or
   `.flywheel/config.local.yaml`.
3. Ensure `playwright-cli` is available. If not, tell the user
   ```text
   Browser polish is blocked: `playwright-cli` was not found.
   ```
   then route to `$flywheel:setup browser`.
4. Open the target in a headed browser:

   ```bash
   playwright-cli open <url> --headed
   ```

5. Let the user browse and call out issues. Use snapshots, screenshots,
   `console`, `network`, and traces when inspection is needed.
6. Make fixes in short loops and rely on app reloads where available.
7. Before calling the polish pass done, run `$flywheel:browser-test` on the changed
   happy path so the final state has fresh evidence.
8. Route onward through `$flywheel:review` and `$flywheel:commit`.

## Output Contract

Return:

1. **Surface polished**
2. **Issues tightened**
3. **Browser proof status**
4. **Next move**
