---
name: jira-to-pr
description: Reusable workflow for turning an authorised Jira issue into approved implementation, verified tests, code review, and a review-ready pull request.
---

# JIRA-to-PR Workflow Skill

Use this skill when the user asks to take a Jira story from requirements through implementation and PR preparation. It describes the process and expected hand-offs; it does not itself grant access to Jira, GitHub, agents, or tools.

## 1. Retrieve and scope the story
- Use the configured Atlassian MCP connection only if it is available and authenticated.
- Confirm the requested issue key and access.
- Extract the user story, acceptance criteria, constraints, dependencies, and unresolved questions.
- If Jira access is unavailable, request the story text or an approved local requirements file. Never fabricate Jira data.

## 2. Plan before editing
- Invoke the `task-planner` agent if supported; otherwise ask the user to select it and provide the issue key/story.
- Apply the `requirement-analysis` skill.
- Produce a short plan, impacted components/files, risks, and test strategy.
- Pause for explicit user approval before implementation.

## 3. Implement in separated scopes
- Use the `task-api-developer` agent for backend/API work.
- Use the `frontend-developer` agent for UI work.
- Avoid concurrent edits to the same files.
- Preserve existing architecture and API behaviour unless the approved acceptance criteria require a change.
- Do not perform unrelated refactoring.
- If agent delegation is unavailable, give the user the next agent name and a precise prompt.

## 4. Test and validate
- Use the `test-engineer` agent.
- Apply `api-test-design` and `change-validation` skills where relevant.
- Map every acceptance criterion to a test or explain why it is not testable.
- Run the available tests and checks; record actual commands and results.
- Distinguish executed tests from proposed tests.
- Fix failures only within the approved scope, then rerun affected checks.

## 5. Review
- Use the `code-reviewer` agent for a read-only review.
- Apply `change-validation`.
- Report findings by severity and include file paths or line references when available.
- Resolve material findings and rerun relevant tests.
- Do not silently ignore unresolved critical/high-severity issues.

## 6. Prepare the pull request
- Use the `pr-creator` agent and apply `pr-preparation`.
- Include a concise summary, requirement/acceptance-criteria mapping, implementation details, test evidence, and known limitations.
- Inspect `git diff` and `git status`.
- Ask for explicit approval before committing, pushing, or creating a PR.
- If required GitHub tools or permissions are missing, prepare the PR description but do not claim that a PR was created.

## Definition of done
- Requirements were retrieved from Jira or supplied explicitly by the user.
- The implementation matches the approved plan.
- Relevant tests were run and results reported honestly.
- Code review was completed and important findings addressed or disclosed.
- A PR description is ready, and publication occurred only after explicit approval.

## Reuse map
- `requirement-analysis`: requirement extraction and planning.
- `api-test-design`: API test cases and edge cases.
- `change-validation`: checks and review criteria.
- `pr-preparation`: PR summary and evidence.

The skill should be used by the `jira-to-pr` orchestrator agent. It can also be adapted for manual, step-by-step workshop delivery.


## Jira status and comment synchronization

The workflow should keep the Jira issue up to date, using the configured Atlassian MCP connection only when it is available, authenticated, and authorised.

1. **When implementation starts:** inspect the issue's current status and available transitions. If the project provides an appropriate `In Progress` transition and the issue is not already in progress, request/perform the approved transition.
2. **When a PR is actually opened and ready for review:** inspect available transitions and move the issue to `Code Review` if that transition exists. A prepared PR description is not evidence that a PR exists.
3. **After work is completed or reaches a stopping point:** draft a Jira comment summarising changes, acceptance criteria addressed, tests actually run and outcomes, review findings, PR URL if available, and remaining limitations.
4. **Before Jira writes:** the `In Progress` and `Code Review` transitions are pre-authorised for the issue key the user provides; announce and verify each. Obtain explicit approval for the summary comment and for any other status change (for example `Accepted` or `Done`).
5. **Verify every write:** re-read the issue or use the tool's returned result to confirm the transition/comment succeeded. If a transition is unavailable or a write fails, report that accurately.
6. **Do not mark Done automatically:** a PR entering code review is not the same as a completed/merged issue. Only move to Done when the project's completion conditions are satisfied and the user explicitly approves it.

Jira status names and transitions vary by project. Discover valid transitions at runtime; never assume a transition called `Code Review` exists.
