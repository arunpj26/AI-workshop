# Acceptance criteria — optional task priority filter

## User story
As a TaskFlow user, I want to filter tasks by priority so that I can focus on tasks with a selected urgency.

## Confirmed behaviour
1. `GET /api/tasks` accepts an optional `priority` query parameter.
2. Supported values are `LOW`, `MEDIUM`, and `HIGH`.
3. If omitted, the endpoint returns all tasks as before.
4. If a valid value is provided, only tasks with that priority are returned.
5. Unsupported values return HTTP `400`.
6. Existing task fields, response shape, and unrelated behaviour remain unchanged.

## Acceptance scenarios
- Given tasks with different priorities, when the endpoint is called without `priority`, all tasks are returned.
- Given tasks with different priorities, when called with `priority=HIGH`, only HIGH tasks are returned.
- Equivalent scenarios for `LOW` and `MEDIUM`.
- Given an unsupported value such as `URGENT`, the endpoint returns HTTP `400`.
- Existing callers omitting the parameter retain the current response contract.

## Clarify before implementation
- Is matching case-sensitive? Do not silently assume case-insensitive matching.
- What response body/error schema should HTTP 400 use? Follow an existing convention or ask.
- Is `?priority=` invalid or equivalent to omitted? Confirm.

## Test matrix
| Case | Input | Expected |
|---|---|---|
| Existing behaviour | no parameter | All tasks; current response contract |
| Valid values | LOW/MEDIUM/HIGH | Only matching tasks |
| Invalid | `priority=URGENT` | HTTP 400 |
| Empty | `priority=` | Clarify expected behaviour |
| Regression | existing endpoint calls | No unrelated behaviour change |
