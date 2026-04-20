# YAML Frontmatter Schema

`schema.yaml` in this directory is the canonical contract for
`docs/solutions/` frontmatter written by `fw:spin`.

Use this file as the quick reference for:

- required fields
- enum values
- validation expectations
- category mapping
- track classification
- retrieval guidance for future Flywheel stages

## Tracks

The `problem_type` determines which **track** applies.

| Track | problem_types | Description |
| --- | --- | --- |
| **Bug** | `build_error`, `test_failure`, `runtime_error`, `performance_issue`, `database_issue`, `security_issue`, `api_contract_issue`, `integration_issue`, `logic_error` | Defects and failures that were diagnosed and fixed |
| **Knowledge** | `best_practice`, `documentation_gap`, `workflow_issue`, `developer_experience`, `operational_guidance` | Practices, workflow improvements, patterns, and durable guidance |

## Required Fields (both tracks)

- **title**: clear, searchable learning title
- **category**: directory slug chosen from the category mapping, for example
  `build-errors` or `workflow-issues`, not the full `docs/solutions/...` path
- **module**: module, subsystem, package, or area affected
- **date**: ISO date in `YYYY-MM-DD`
- **problem_type**: one of the values listed in the Tracks table
- **component**: one of `backend`, `frontend`, `api`, `cli`, `database`,
  `cache`, `queue`, `messaging`, `auth`, `payments`, `build_system`, `ci_cd`,
  `infrastructure`, `deployment`, `data_pipeline`, `test_harness`,
  `developer_workflow`, `documentation`, `tooling`, `library`,
  `service_integration`
- **severity**: one of `critical`, `high`, `medium`, `low`
- **doc_status**: `active` for current guidance, `superseded` for historical
  docs that should not be used as the first answer
- **files_touched**: one or more repo-relative files or directories
- **tags**: 2-8 lowercase, hyphen-separated search keywords

## Bug Track Fields

Required:

- **symptoms**: YAML array with 1-5 observable symptoms
- **root_cause**: one of the schema enum values
- **resolution_type**: one of the schema enum values

## Knowledge Track Fields

Required:

- **applies_when**: at least one concrete condition that says when this
  guidance applies

Optional when useful:

- **symptoms**
- **root_cause**
- **resolution_type**

## Optional Fields

- **related_components**: other components involved
- **related_issues**: issue, PR, or doc references
- **related_docs**: repo-relative paths to neighboring solution docs
- **supersedes**: repo-relative docs this entry replaces as the current answer
- **superseded_by**: repo-relative doc that replaces this entry
- **last_updated**: ISO date for refreshed docs

## Category Mapping

- `build_error` -> `build-errors` -> `docs/solutions/build-errors/`
- `test_failure` -> `test-failures` -> `docs/solutions/test-failures/`
- `runtime_error` -> `runtime-errors` -> `docs/solutions/runtime-errors/`
- `performance_issue` -> `performance-issues` -> `docs/solutions/performance-issues/`
- `database_issue` -> `database-issues` -> `docs/solutions/database-issues/`
- `security_issue` -> `security-issues` -> `docs/solutions/security-issues/`
- `api_contract_issue` -> `api-contract-issues` -> `docs/solutions/api-contract-issues/`
- `integration_issue` -> `integration-issues` -> `docs/solutions/integration-issues/`
- `logic_error` -> `logic-errors` -> `docs/solutions/logic-errors/`
- `best_practice` -> `best-practices` -> `docs/solutions/best-practices/`
- `documentation_gap` -> `documentation-gaps` -> `docs/solutions/documentation-gaps/`
- `workflow_issue` -> `workflow-issues` -> `docs/solutions/workflow-issues/`
- `developer_experience` -> `developer-experience` -> `docs/solutions/developer-experience/`
- `operational_guidance` -> `operational-guidance` -> `docs/solutions/operational-guidance/`

## Retrieval Guidance

Future Flywheel stages should search `docs/solutions/` by frontmatter before
opening full files.

Filter rules before ranking:

1. prefer docs with `doc_status: active`
2. if a strong hit has `superseded_by`, follow that path first and treat the
   current doc as historical context only

Recommended order:

1. `files_touched` or path fragments
2. `module`
3. `tags`
4. `problem_type`
5. `component`
6. `title`

Read frontmatter first. Fully read only the strongest hits.

## Validation Rules

1. Determine the track from `problem_type`.
2. All shared required fields must be present.
3. Bug-track required fields must be present on bug-track docs.
4. Knowledge-track docs must include `applies_when`.
5. Enum fields must match the allowed values exactly.
6. `category` must match the mapped directory slug for the chosen `problem_type`.
7. Array fields must respect min and max item counts.
8. `date` and `last_updated`, when present, must match `YYYY-MM-DD`.
9. `files_touched` must be repo-relative.
10. `tags` should be lowercase and hyphen-separated.
11. New or refreshed canonical docs should use `doc_status: active`.
12. `doc_status: superseded` docs should set `superseded_by`.
