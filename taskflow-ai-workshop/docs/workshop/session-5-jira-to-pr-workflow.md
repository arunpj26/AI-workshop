# Session 5 — Step-by-step Jira-to-PR workshop

## Teaching goal
Show attendees a visible, controlled AI-assisted engineering lifecycle: run the baseline, inspect a Jira story, plan, implement, test, review, and prepare a pull request. The aim is not to have one agent magically do everything; each stage should produce an artifact the attendee can inspect and approve.

## Before the session
- Open the repository root in VS Code.
- Confirm Git, Java 25, Maven (or the project Maven wrapper), VS Code, and GitHub Copilot are available.
- Confirm the app builds and can start.
- Confirm the custom agents and prompt files are discovered by the installed Copilot version.
- Confirm the Jira MCP connection is authenticated and attendees have permission to read the training issue `AIW-5`.
- Keep a clean Git branch for each attendee/team and ensure no credentials are in the repository.
- Do not assume Copilot can open a browser in every environment; have the attendee open the localhost URL manually as a fallback.

## Workflow to demonstrate

### 1. Run and inspect the baseline
In Copilot Chat, run the prompt `/application-run-local` (or choose it from prompt suggestions if slash-command discovery differs). Follow its instructions. The expected URL is usually `http://localhost:8080/` because Spring Boot serves the static frontend and API. Inspect the UI in the browser and note issues before changing code.

If the prompt cannot start a long-running process or open a browser, run the documented command in the VS Code terminal and open the URL manually. The prompt must report actual results, not claim success without verification.

### 2. Plan the Jira issue
Select the **Task Planner** agent, then enter the Jira issue key and the task:
`Read Jira issue AIW-5 using the configured Atlassian MCP connection. Summarise the story, acceptance criteria, affected components, risks, and a step-by-step implementation plan. Do not modify files or Jira. Ask me to approve the plan.`

Review the issue content and plan. If MCP is not configured, use the agreed story/acceptance-criteria file as a fallback and disclose that Jira was not accessed.

### 3. Implement backend and frontend in small stages
After the plan is approved:
- Select **Task API Developer** and ask it to implement the backend/API part of the approved acceptance criteria.
- Review the diff and test results before proceeding.
- Select **Frontend Developer** and ask it to implement the UI part against the actual API contract.
- Do not have both agents edit overlapping files concurrently.
- Keep the scope to the story; avoid unrelated refactoring.

### 4. Test
Select **Test Engineer**. Ask it to map each acceptance criterion to an existing or new test, run relevant tests, and report exact outcomes. Separate tests that ran from tests that were only proposed. Fix failures, then rerun the affected tests.

### 5. Review
Select **Code Reviewer** and ask for a read-only review against the story and acceptance criteria. Resolve findings and rerun relevant tests. The reviewer should not silently edit the code.

### 6. Prepare the PR
Select **PR Creator** and ask it to prepare a summary, testing evidence, and a draft PR description. Inspect `git diff`, `git status`, and the proposed summary. The attendee must explicitly approve any commit, push, or actual PR creation. If a GitHub tool/CLI is unavailable or unauthenticated, produce PR-ready text rather than claiming a PR was created.

## Example final prompt
`Prepare a PR description for AIW-5 using the approved acceptance criteria and actual changes. Include summary, implementation notes, tests actually run with outcomes, and known limitations. Do not commit, push, or create the PR until I explicitly approve.`

## Suggested 60-minute timing
- 0–7 min: run app and inspect baseline
- 7–15 min: Task Planner + AIW-5
- 15–30 min: API Developer and Frontend Developer, in sequence
- 30–40 min: Test Engineer
- 40–48 min: Code Reviewer and fixes
- 48–55 min: PR Creator and PR summary
- 55–60 min: debrief and compare human review vs AI output

## Important teaching point
The goal is to show the progression from Jira to PR-ready changes, while each step remains visible and reviewable. A reusable `JIRA-to-PR` skill can eventually orchestrate this sequence, but for Session 5 attendees should run each stage separately to understand the responsibilities, outputs, and approval gates. Only after they understand the individual stages should you demonstrate the end-to-end skill as a comparison.


## Optional final demonstration: JIRA-to-PR orchestrator
After attendees understand each stage, select the `JIRA-to-PR` agent (`.github/agents/jira-to-pr.agent.md`) and provide `AIW-5`. The agent is instructed to reuse the `jira-to-pr` skill and the existing specialist agents/skills, with approval gates before implementation and publishing.

Use this as an orchestration demonstration, not a guarantee of fully automatic delegation: the installed Copilot runtime must support custom-agent delegation, skill discovery, Jira MCP and any GitHub actions. If delegation is unavailable, the agent should guide the attendee to select each specialist agent manually. Never claim Jira access, test success, or PR creation without evidence.

Recommended teaching order:
1. Run locally and inspect.
2. Execute each specialist stage manually so attendees understand it.
3. Demonstrate `JIRA-to-PR` as the reusable end-to-end entry point.


## Jira status and summary updates (instructor demonstration)

When implementation begins, the `JIRA-to-PR` workflow should inspect the Jira issue and its available transitions. If an appropriate `In Progress` transition exists, update the issue after the attendee has authorised Jira writes.

When a real PR has been created and is ready for review, inspect the available transitions again and move the issue to `Code Review` only if that transition exists in the project's workflow.

At the end, prepare a Jira comment that includes:
- Implementation summary and acceptance criteria addressed
- Tests actually executed and results
- Code-review outcome and any outstanding findings
- PR URL, only if a PR was actually created
- Known limitations and follow-up items

Get explicit approval before posting the comment unless attendees have explicitly authorised final summary comments for this workflow. Verify each Jira write. Do not mark the issue Done merely because a PR was created; completion depends on the team's workflow and merge/release criteria.

**Live-demo note:** Jira status names and available transitions differ by project. The Atlassian MCP connection must be authenticated and have write permissions. If `In Progress` or `Code Review` is not an available transition, report this and do not invent a transition.


## Local prerequisite handling
The `/application-run-local` prompt checks the OS, Java version, Maven availability, Maven Wrapper, and (when end-to-end browser tests are requested) Node.js/npm and Playwright. It should reuse compatible tools already available and avoid duplicate installations. Prefer the project's Maven Wrapper when it works; global Maven is not required in that case. If a required tool is missing, the prompt explains the proposed official/approved installation and asks for explicit approval before installing or running administrator-level commands. Browser-test dependencies are optional for simply starting the application. Actual installation and browser-opening capabilities depend on the attendee's environment.
