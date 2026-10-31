# AI-Assisted Engineering with GitHub Copilot — session plan

Total: 220 minutes (3h40, excluding optional breaks).

## Session 1 — Advanced Prompting and Copilot Workflow Design (45 min)
Files: `docs/requirements/acceptance-criteria.md`, plus four prompt files under `.github/prompts/`.
Timing: 0–5 vague vs structured prompts; 5–13 requirement analysis; 13–20 criteria; 20–35 reusable prompts; 35–42 test prompt; 42–45 recap. Do not implement yet.

## Session 2 — Repository Instructions and Customization (35 min)
Files: `.github/copilot-instructions.md` and the Java, frontend, and Playwright instruction files. Show common vs file-specific guidance; verify `applyTo` paths.

## Session 3 — Custom Agents, Skills, and Hooks (35 min)
Files: 5 agents, 4 skills, 2 hook files. Timing: 0–5 concepts; 5–15 build one agent and one skill; 15–22 inspect prepared examples; 22–30 demonstrate a tested hook in a disposable workspace; 30–35 verify discovery and discuss limits. Do not ask attendees to type all 11 files from scratch.

## Session 4 — MCP, Security, Responsible AI (45 min)
Optional `.vscode/mcp.json`. Configure/verify Atlassian MCP, complete OAuth, test read access to an authorized Jira issue, discuss prompt injection, least privilege, secrets, and approvals. Keep a pasted-story fallback.

## Session 5 — Hands-on AI-Assisted Engineering (60 min)
No new configuration files required. Retrieve story; analyse; review plan; approve/revise/cancel; implement; add backend tests; run app; verify API/UI; add and run headed Playwright; capture evidence; review; fix findings; rerun tests; prepare PR. Explicit approval is required before commit/push/PR creation.

## File count
- Session 1: 5
- Session 2: 4
- Session 3: 11
- Session 4: 0–1
- Session 5: 0 new config files required beforehand
- Total: 20–21, excluding source, test output, screenshots, and PR artifacts.

## Agent-to-skill mapping
| Agent | Skill(s) | Prompt template(s) |
|---|---|---|
| Task Planner | requirement-analysis | understand-requirement, plan-feature |
| Task API Developer | api-test-design | plan-feature, generate-tests |
| Test Engineer | api-test-design, change-validation | generate-tests |
| Code Reviewer | change-validation; api-test-design for coverage | review-changes |
| PR Creator | pr-preparation | review-changes |

Prompts/skills are not automatically invoked merely because files exist. Agents explicitly reference relevant skills; verify discovery in the selected Copilot runtime.
