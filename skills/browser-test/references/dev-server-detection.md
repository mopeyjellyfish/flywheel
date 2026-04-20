# Dev Server Detection

When the input does not already provide a target URL, discover the web surface
from repo truth in this order:

1. `.flywheel/config.local.yaml`
   - `browser.base_url`
   - `browser.dev_command`
2. Repo instructions
   - `AGENTS.md`
   - `CLAUDE.md`
   - `README.md`
3. App manifests and scripts
   - `package.json` scripts such as `dev`, `start`, `web`, `preview`
   - `Makefile` or `justfile`
   - `docker-compose.yml` or compose variants
4. Existing Playwright config or tests
   - `playwright.config.*`
   - test helpers that define a base URL

Prefer the repo's own command and port over common-framework guesses.

If the repo shows a stable dev command and URL, use them.

If the repo has a web surface but the start command is still ambiguous, stop
and ask one focused question instead of inventing a server workflow.
