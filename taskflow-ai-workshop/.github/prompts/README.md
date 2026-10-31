# Prompt files — Session 1
- `jira-connect.prompt.md`: read-only check of the Atlassian MCP connection; run it first (`/jira-connect`) in every new chat before a Jira-based agent.
- `understand-requirement.prompt.md`: restate story, separate facts from assumptions, ask questions, draft criteria.
- `plan-feature.prompt.md`: produce a file-level implementation/test plan and wait for approval.
- `generate-tests.prompt.md`: map criteria to tests and report observed outcomes.
- `regression-test.prompt.md`: execute focused and full regression checks for the current changes and report exact results.
- `review-changes.prompt.md`: read-only diff review.
- `standards-review.prompt.md`: audit the current changes against repository-specific implementation, testing, security, and maintainability standards.
- `application-run-local.prompt.md`: check Java/Node, run `npm install` and `npx playwright install chromium` if needed, start TaskFlow locally and verify backend and UI (run it as `/application-run-local`).

Prompt files are reusable task starters, not permanent repository rules. Invoke them using the workflow supported by your VS Code/Copilot version. Verify discovery in the actual workshop environment.
