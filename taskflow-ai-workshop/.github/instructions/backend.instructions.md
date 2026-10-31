---
description: Java/Spring Boot backend and JUnit/MockMvc test conventions for TaskFlow.
applyTo: "src/main/java/**/*.java,src/test/java/**/*.java"
---
# Backend (Java and Spring Boot) instructions
- Use versions declared in `pom.xml`; do not upgrade dependencies as part of a feature unless approved.
- Keep controllers thin and put business behaviour in the service layer where appropriate.
- Validate query parameters at the API boundary and return consistent HTTP responses.
- Preserve existing endpoint contracts when adding optional parameters.
- Prefer constructor injection; avoid field injection.
- Add JUnit tests for positive, negative, boundary, and regression behaviour.
- Follow existing Spring Boot Test/MockMvc patterns.
- Do not swallow exceptions or return success for invalid input.
- Do not log credentials, tokens, or unnecessary personal/request data.
- Keep changes focused and avoid unrelated formatting.
