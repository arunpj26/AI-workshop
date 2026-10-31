# Copilot agents

These role-specific agent files are intended for a compatible GitHub Copilot environment. Availability and discovery depend on the VS Code/Copilot version and configuration.

- `task-planner.agent.md`: analyse requirements, propose a plan, and save it (with the Jira information) to `docs/plans/<ISSUE-KEY>-plan.md`. It is the only agent that writes that file.
- `task-api-developer.agent.md`: implement the saved plan's backend section and its backend tests only.
- `frontend-developer.agent.md`: implement the saved plan's frontend section only (existing HTML/CSS/JavaScript UI).
- `test-engineer.agent.md`: create/run backend and Playwright tests from the saved plan's test section.
- `code-reviewer.agent.md`: review changes without editing files.
- `html-reviewer.agent.md`: read-only review of HTML structure, accessibility, semantics, IDs/attributes, and maintainability; reports findings without editing files.
- `pr-creator.agent.md`: prepare a review-ready change summary/PR content; explicit approval is required before creating or publishing anything.
- `jira-to-pr.agent.md`: orchestrator that delegates to the six specialists above and follows the `jira-to-pr` skill, pausing at approval gates.

## Demo flows
Select agents from the chat agent picker (there is no `@` mention) and type the Jira key, for example `AIW-5`.

**Stage by stage.** Each agent has a single purpose and never asks another agent to do its work. The planner offers hand-off buttons to the two developers; the others do not. You pick the next agent yourself. Everything after planning reads the saved plan file (`docs/plans/AIW-5-plan.md`) instead of Jira or the chat history:
1. `/application-run-local` (a prompt, not an agent)
2. `task-planner`: `AIW-5` (approve the plan)
3. `task-api-developer`
4. `frontend-developer`
5. `test-engineer`
6. `code-reviewer`
7. `pr-creator`

**One agent:** select `jira-to-pr` and type `AIW-5`. It delegates to the specialists and stops at each approval gate.

## Jira status by stage
Workflow statuses in this Jira project: To Do, In Progress, Code Review, Accepted, Done.

| Stage | Jira status | Who changes it |
|---|---|---|
| 1 Run locally, 2 Plan | To Do | nobody (`task-planner` is read-only for Jira) |
| 3 Backend / 4 Frontend | **In Progress** | whichever of `task-api-developer` / `frontend-developer` starts first, as its Step 0 before any other work (even if the backend plan says no backend work); the other sees it is already In Progress and skips it |
| 5 Testing, 6 Review | In Progress | no change |
| 7 PR created | **Code Review** | `pr-creator`, only once a real PR URL exists; the summary comment still needs your approval |
| After merge | Accepted / Done | only on your explicit request |

The two transitions (In Progress, Code Review) are pre-authorised for the issue key you type; each agent announces the change and verifies the result. Nothing else in Jira is edited without your approval.

`tools:` lists restrict what each agent can do: the reviewer has no edit tool, and the planner's edit tool is limited by its instructions to the plan file. Jira tool names are listed for both `atlassian` and `atlassian-mcp` server ids; check the tools picker to confirm which one your setup uses.
