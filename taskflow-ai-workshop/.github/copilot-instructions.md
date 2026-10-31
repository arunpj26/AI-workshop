# Project Copilot Instructions

## General Workflow

- Read the relevant code, tests, and repository instructions before making changes.
- Keep implementations minimal, focused, and consistent with the existing architecture and conventions.
- Prefer established project patterns and APIs over introducing new abstractions.
- Do not modify configuration, dependencies, generated files, ports, or application behavior unless the change requires it and is clearly understood.

## Implementation

- Make only changes required by the request.
- Preserve public APIs and existing behavior unless a change is explicitly requested.
- Handle errors clearly and do not expose secrets, credentials, or environment-variable values in logs, code, or responses.
- Add or update focused tests for behavior changes.

## Validation

- Use the repository's declared wrappers, scripts, and test commands.
- Run the narrowest relevant build, test, lint, or type check first.
- Do not report success without executable evidence or confirmed HTTP responses where applicable.
- Report the files changed, validation performed, and any remaining limitations.

## Safety

- Never commit, push, create a pull request, merge, deploy, or perform other external actions unless the user explicitly authorizes them.
- Do not delete or revert unrelated user changes.
- Ask before using elevated privileges or installing system software.
