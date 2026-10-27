# Workshop requirement: optional task priority filter

## User story
As a TaskFlow user, I want to filter tasks by priority so I can focus on tasks that need a particular level of attention.

## Acceptance criteria
1. `GET /api/tasks?priority=HIGH` returns only HIGH-priority tasks.
2. Supported values are `LOW`, `MEDIUM`, and `HIGH`.
3. Omitting `priority` returns all tasks and preserves current behaviour.
4. Unsupported values return HTTP `400 Bad Request` with a clear message.
5. Priority matching is case-insensitive, or a different policy is documented and tested.
6. Add unit/integration tests for valid values, omitted parameter, and invalid value.
7. Update the UI to apply and clear a priority filter.
8. Add Playwright tests for filtering HIGH and clearing the filter.

## Scope note
The baseline does not implement pagination or sorting. Do not invent those features unless the facilitator explicitly extends the exercise.

## Out of scope
Authentication, persistence, create/edit/delete, and real company data.
