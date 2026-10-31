# Validation status of the workshop starter

Validated during package generation:
- `.vscode/mcp.json` parses as JSON.
- `.github/hooks/security-policy.json` parses as JSON.
- `pom.xml` parses as XML.
- `enforce-network-policy.cjs` passes `node --check`.
- Hook fixture denies a direct `curl` shell command and allows a harmless `mvn test` command string.

Not validated here:
- Maven test suite could not be launched in this environment because the `mvn` executable returned an operating-system permission error.
- Jira OAuth and MCP tool discovery require a user's VS Code/Copilot session and Atlassian account, so they must be verified on the attendee's machine.
- Hook enforcement must be verified in the exact Copilot runtime; the script is only a pattern-based workshop guardrail, not a complete network/IP/location security boundary.
- Playwright E2E tests require the correct Node dependencies, browsers, and app runtime to be installed.
