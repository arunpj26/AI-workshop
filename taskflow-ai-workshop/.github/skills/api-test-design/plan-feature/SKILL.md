---
name: plan-feature
description: Create a reviewable implementation and test plan without changing files.
disable-model-invocation: true
---
Using the approved story and acceptance criteria, inspect relevant files and produce a plan only. Do not create or edit files.

Include criteria-to-code/test mapping, files to add/change and reasons, API/UI/E2E implications, exact validation commands based on repository scripts, risks, unanswered questions, and ordered small implementation steps.

End by asking the user to choose APPROVE, REVISE, or CANCEL. Do not implement until explicit approval. Ask rather than inventing rules when requirements are ambiguous.
