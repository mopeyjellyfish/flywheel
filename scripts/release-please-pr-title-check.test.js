#!/usr/bin/env node

const assert = require("assert");
const { checkPrTitle } = require("./release-please-pr-title-check.js");

function assertOk(title) {
  assert.strictEqual(checkPrTitle(title).ok, true, title);
}

function assertRejected(title) {
  const result = checkPrTitle(title);
  assert.strictEqual(result.ok, false, title);
  assert.match(result.message, /Release Please reads merge-commit PR titles/);
}

assertOk("Add plugin validation and release automation");
assertOk("chore(ci): add validation workflow");
assertOk("docs: explain release process");

assertRejected("feat(ci): add plugin validation and release automation");
assertRejected("fix(ci): bootstrap initial release history");
assertRejected("deps: update release tooling");
assertRejected("feat!: replace release process");
assertRejected("fix(ci)!: change release process");
