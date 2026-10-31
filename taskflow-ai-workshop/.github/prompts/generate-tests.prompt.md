---
name: generate-tests
agent: agent
description: Design and implement tests mapped to approved acceptance criteria.
---
Use the approved criteria and existing test conventions. First list the criteria-to-test mapping and gaps. Cover valid values, omitted optional parameter, invalid and empty input, boundary/no-match cases, and regression behaviour as applicable. Assert status, response shape, and meaningful returned data.

Then implement only tests within the approved plan. Use existing dependencies and deterministic assertions. Run focused tests if possible and report exact commands and observed results. Separate not-run checks from passing checks; do not weaken assertions merely to pass.
