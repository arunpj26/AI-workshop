# External integrations: Jira via Atlassian MCP

Workspace config: `.vscode/mcp.json`. It points to Atlassian's official remote MCP v2 endpoint. Follow `.vscode/README.md` to authenticate through the supported client UI.

- Retrieve only an issue the user identifies or explicitly asks to read.
- Access follows the authenticated Atlassian account and organization policies.
- Do not put secrets in the repository.
- Use `docs/requirements/jira-sample-issue.md` if MCP setup/authentication is unavailable.
- Do not create/update Jira issues unless the user explicitly approves the specific action.

Setup: https://support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/
