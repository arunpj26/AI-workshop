# Workshop security notes

`.github/hooks/security-policy.json` registers a Copilot `preToolUse` hook. `.github/hooks/enforce-network-policy.cjs` is a pattern-based workshop guardrail that denies some obvious shell network commands and direct `web_fetch` tool calls.

This is **not** a complete network/IP/location security boundary. It cannot reliably detect indirect network access through arbitrary scripts, other tools, extensions, browser sessions, or MCP servers; patterns can also have false positives/negatives. Use administrator-managed policy, firewalling, OS/container sandboxing, and approved tool permissions for controls that must be enforced. Test hooks in a disposable workspace.

Hook support and schema vary by runtime/version and the VS Code hook experience may be Preview. Check:
- https://code.visualstudio.com/docs/agent-customization/hooks
- https://docs.github.com/en/copilot/reference/hooks-reference

Never store credentials in hooks, logs, MCP config, prompts, or source. Do not log complete prompts, tool arguments, or outputs.
