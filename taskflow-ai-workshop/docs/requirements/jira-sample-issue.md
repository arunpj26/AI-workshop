# Fictional Jira issue — fallback for Session 4

**Key:** DEMO-123  
**Summary:** Add an optional priority filter to TaskFlow

As a user, I want to filter tasks by priority.

Acceptance criteria:
- `GET /api/tasks?priority=HIGH` returns only HIGH tasks.
- Supported values: LOW, MEDIUM, HIGH.
- Omitted parameter returns all tasks.
- Unsupported value returns HTTP 400 with a helpful message.
- UI can apply and clear the filter.
- Backend and browser tests cover the main scenarios.

This is fictional workshop data. Do not replace it with confidential company issue content in a public repository.
