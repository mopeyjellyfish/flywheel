---
name: fw-polish
description: "Run an interactive browser polish loop on a browser-visible feature using playwright-cli, live app reloads, and quick fix iterations. Use when the user wants to try the feature, call out rough edges, and tighten it before review or shipping."
metadata:
  argument-hint: "[url, route, branch, or blank to use the current browser-visible surface]"
---

# Polish

`/fw-polish` is Flywheel's interactive browser polish loop.

Use it when the feature is already runnable and the job is to tighten behavior,
UX, or visual rough edges through short iteration.

This skill uses `playwright-cli` as the browser-control surface.

## Workflow

1. Get onto the correct branch or worktree. Prefer `/fw:worktree` over ad hoc
   checkout switching when isolation matters.
2. Discover or start the local web surface using repo truth or
   `.flywheel/config.local.yaml`.
3. Ensure `playwright-cli` is available. If not, tell the user
   ```text
   Browser polish is blocked: `playwright-cli` was not found.
   ```
   then route to `/fw:setup browser`.
4. Open the target in a headed browser:

   ```bash
   playwright-cli open <url> --headed
   ```

5. Let the user browse and call out issues. Use snapshots, screenshots,
   `console`, `network`, and traces when inspection is needed.
6. Make fixes in short loops and rely on app reloads where available.
7. Before calling the polish pass done, run `/fw-browser-test` on the changed
   happy path so the final state has fresh evidence.
8. Route onward through `/fw:review` and `/fw:ship`.

## Output Contract

Return:

1. **Surface polished**
2. **Issues tightened**
3. **Browser proof status**
4. **Next move**
