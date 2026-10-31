# Configuration reference: connections

## Prompts
- `understand-requirement`: restate story, facts vs assumptions, questions, criteria.
- `plan-feature`: implementation/test plan; wait for approval.
- `generate-tests`: criteria-to-tests mapping and honest results.
- `review-changes`: read-only diff review.
- `application-run-local`: start the app locally and verify backend and UI.

## Agent → skill → prompt mapping
| Agent | Skills | Prompt templates |
|---|---|---|
| `task-planner` | `requirement-analysis` | `understand-requirement`, `plan-feature` |
| `task-api-developer` | `api-test-design` | `plan-feature`, `generate-tests` |
| `frontend-developer` | none | none (reads `frontend.instructions.md`) |
| `test-engineer` | `api-test-design`, `change-validation` | `generate-tests` |
| `code-reviewer` | optionally `api-test-design` | `review-changes` |
| `pr-creator` | `pr-preparation` | `review-changes` |
| `jira-to-pr` (orchestrator) | `jira-to-pr`, plus the skills above via delegation | none |

Agents declare `tools:` (the planner and reviewer cannot edit), and the chain `task-planner` → `task-api-developer` → `frontend-developer` → `test-engineer` → `code-reviewer` → `pr-creator` is wired with `handoffs:`. `jira-to-pr` lists the six specialists in `agents:`.

## Hooks
`.github/hooks/security-policy.json` registers the `PreToolUse` hook (and the Copilot CLI `preToolUse` alias). `enforce-network-policy.cjs` blocks some obvious shell network commands (`run_in_terminal` and similar) and direct web-fetch tools (`fetch_webpage`). `curl`/`wget`/`Invoke-WebRequest` calls to `localhost`, `127.0.0.1` or `api.media.atlassian.com` (Jira attachment downloads) only are allowed. This is only a workshop guardrail, not full network/IP/location enforcement. Arbitrary scripts, other tools, and MCP may bypass pattern matching.

## Jira MCP
`.vscode/mcp.json` configures the official Atlassian remote MCP v2 endpoint. Complete OAuth in the supported client. No credentials belong in the repository; access respects the authenticated account's permissions.

## Approval gates
Approve plan before coding. Explicitly approve commit, push, PR creation, merge, deployment, and external Jira writes.
