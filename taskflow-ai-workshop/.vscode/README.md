# VS Code workspace configuration

## Atlassian MCP for Jira
`.vscode/mcp.json` points to Atlassian's official remote MCP v2 endpoint: `https://mcp.atlassian.com/v2/mcp`.

1. Open this repository in a supported, up-to-date VS Code version with GitHub Copilot enabled.
2. Open MCP servers / Agent Customizations and inspect the `atlassian` server.
3. Start/restart it and follow the browser-based Atlassian OAuth flow if prompted.
4. Sign in to the correct Atlassian Cloud site and grant only approved permissions.
5. Verify read access with a Jira issue key you are allowed to view.
6. Do not perform write actions unless separately required and explicitly approved.

The endpoint alone does not authenticate you or grant permissions. Never place API tokens/passwords in this file. If this config is unsupported by your VS Code version, search Extensions for `@mcp Atlassian` and follow the current official setup guide.

References:
- https://github.com/atlassian/atlassian-mcp-server
- https://support.atlassian.com/atlassian-ai-gateway/docs/get-started-with-the-atlassian-remote-mcp-server/
- https://code.visualstudio.com/docs/agents/reference/mcp-configuration
