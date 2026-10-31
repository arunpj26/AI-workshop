---
name: review-changes
description: "Review the current diff against requirements, correctness, security, and test evidence."
disable-model-invocation: true
---
Review the current Git diff against the approved story and acceptance criteria. Do not edit files automatically.

Check acceptance criteria, compatibility, error handling, test quality/coverage, security/privacy, secrets, dependency changes, scope creep, documentation, and whether claimed test results have evidence.

Return findings grouped Critical/High/Medium/Low with file/line references where possible, impact, and recommended fix. Distinguish confirmed defects from questions/risks. If no findings are identified, describe what was reviewed and what was not verified. Do not claim unrun checks passed.
