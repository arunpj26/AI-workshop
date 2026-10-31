# Feature: Task priority filter

As a TaskFlow user, I want to filter tasks by priority so I can focus on tasks with a selected urgency.

- Add optional `priority` to `GET /api/tasks`.
- Supported values: `LOW`, `MEDIUM`, `HIGH`.
- Omitted parameter returns all tasks as before.
- Valid value returns only matching tasks.
- Invalid value returns HTTP 400.
- Preserve response shape and unrelated behaviour.

Clarify case sensitivity and empty `priority` behaviour. Follow an existing error response convention or ask. See `acceptance-criteria.md`.
