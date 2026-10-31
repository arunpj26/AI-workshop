# TaskFlow Copilot Instructions

## Project

- TaskFlow is a Spring Boot application that serves the static frontend from `src/main/resources/static/`.
- The backend uses Java 25 (the current LTS), Spring Boot, Maven, and H2.
- Use the repository Maven Wrapper (`mvnw.cmd` on Windows or `./mvnw` on Unix-like systems).
- Keep backend and frontend changes small, focused, and consistent with the existing code.

## Development

- Inspect the relevant implementation, tests, and requirements before editing.
- Prefer existing project patterns and APIs over introducing new abstractions.
- Do not change dependencies, configuration, or public API contracts unless the task requires it.
- Never add secrets, credentials, or environment-specific values to the repository.
- Preserve unrelated user changes in the working tree.

## Validation

- Run focused tests first, then broaden validation when the change affects shared behavior.
- Backend tests: `./mvnw test` or `mvnw.cmd test`.
- Start the application locally with `./mvnw spring-boot:run` or `mvnw.cmd spring-boot:run`.
- The normal local URL is `http://localhost:8080/`.
- API checks should verify the actual response from the relevant endpoint.
- Frontend end-to-end tests use Playwright and the scripts in `package.json`.

## Scoped Guidance

- Follow `.github/instructions/backend.instructions.md` for Java and JUnit/MockMvc work.
- Follow `.github/instructions/frontend.instructions.md` for static HTML, CSS, and JavaScript work.
- Follow `.github/instructions/playwright.instructions.md` for Playwright tests and configuration.
- Read the applicable requirements under `docs/requirements/` before implementing feature work.
