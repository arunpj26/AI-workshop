# Task API package

This package contains the task domain model, service, and API controller. Keep controllers focused on HTTP concerns and use the existing service layer for task behaviour.

For the workshop priority-filter feature:
- Review `TaskController`, `TaskService`, and the corresponding tests first.
- Preserve existing response shape and behaviour when `priority` is omitted.
- Validate unsupported values and return HTTP 400 according to the existing API error convention.
- Add focused tests for each valid priority, invalid values, omitted parameter, and regression behaviour.
- Confirm case-sensitivity and empty-parameter behaviour before implementing if the product owner has not specified them.
