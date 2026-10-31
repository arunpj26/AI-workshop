---
name: api-test-design
description: Design deterministic API/backend tests mapped to acceptance criteria.
---
# API test design
1. Read criteria and existing tests.
2. Create a criterion-to-test matrix.
3. Cover valid inputs, omitted optional values, invalid/empty inputs, boundary/no-result cases, and regression behaviour as relevant.
4. Assert status, response shape, and meaningful data.
5. Keep tests independent and deterministic, consistent with existing conventions.
6. Prefer focused behaviour assertions over brittle implementation details.
7. Run focused tests and capture actual output.
8. Report checks not run and remaining gaps.
Do not change product expectations just to make tests pass.
