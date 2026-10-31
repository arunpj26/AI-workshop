# AI-assisted development lifecycle

```text
Jira issue / user-provided story
        |
        v
Task Planner + requirement-analysis
        |
        v
Acceptance criteria + implementation plan
        |
        v
HUMAN APPROVAL: approve / revise / cancel
        |
        v
Task API Developer + api-test-design
        |
        v
Test Engineer + change-validation
        |
        v
Code Reviewer (read-only)
        |
        v
Fix findings and re-run tests
        |
        v
PR Creator + pr-preparation
        |
        v
HUMAN APPROVAL before commit / push / PR creation
```

Instructions = persistent rules; prompts = task starters; agents = roles; skills = reusable methods; MCP = approved external tools/context; hooks = supported lifecycle guardrails. Do not skip plan approval. Report only tests actually run.
