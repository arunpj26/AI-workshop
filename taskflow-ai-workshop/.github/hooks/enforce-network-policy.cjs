'use strict';

/**
 * Workshop-only preToolUse guardrail. Blocks some obvious direct shell network
 * commands and web_fetch tool calls. It is NOT a complete network security
 * boundary and cannot control every script, extension, browser, MCP server,
 * IP route, or device-location API. Use network/OS/admin controls for enforcement.
 */
const fs = require('node:fs');

function output(value) {
  process.stdout.write(JSON.stringify(value));
}

// Emits both the Copilot CLI shape (top-level) and the VS Code shape (hookSpecificOutput).
function deny(reason) {
  output({
    permissionDecision: 'deny',
    permissionDecisionReason: reason,
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  });
}

function asText(value) {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  try { return JSON.stringify(value); } catch { return String(value); }
}

// Hosts allowed for shell downloads: local app plus Atlassian's attachment download host.
const ALLOWED_HOST = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|api\.media\.atlassian\.com|api\.github\.com)(:\d+)?$/;

function onlyAllowedUrls(text) {
  const urls = text.match(/https?:\/\/[^\s"'\\/]+/g) || [];
  return urls.length > 0 && urls.every((u) => ALLOWED_HOST.test(u));
}

const WEB_TOOLS = ['web_fetch', 'webfetch', 'fetch_webpage'];
const SHELL_TOOLS = ['bash', 'powershell', 'shell', 'terminal', 'run_in_terminal', 'runinterminal', 'execute'];

function main() {
  let event;
  try {
    event = JSON.parse(fs.readFileSync(0, 'utf8'));
  } catch {
    deny('The workshop policy hook could not parse its event input. Stop and ask the facilitator.');
    return;
  }

  const toolName = String(event.toolName || event.tool_name || '').toLowerCase();
  const args = event.toolArgs !== undefined ? event.toolArgs :
    (event.tool_input !== undefined ? event.tool_input : {});
  const text = asText(args).toLowerCase();

  if (WEB_TOOLS.includes(toolName)) {
    deny('Direct web fetching is restricted by this workshop guardrail. Use an approved integration or ask the facilitator.');
    return;
  }

  if (!SHELL_TOOLS.includes(toolName)) {
    output({});
    return;
  }

  const patterns = [
    /\bcurl(\.exe)?\b/,
    /\bwget(\.exe)?\b/,
    /\binvoke-webrequest\b/,
    /\binvoke-restmethod\b/,
    /\b(irm|iwr)\b/,
    /\bnetcat\b|\bnc\s+-/,
    /\b(ssh|scp|sftp)\b/
  ];
  const remoteShellOnly = /\b(ssh|scp|sftp)\b|\bnetcat\b|\bnc\s+-/;
  if (patterns.some((p) => p.test(text))) {
    if (!remoteShellOnly.test(text) && onlyAllowedUrls(text)) {
      output({});
      return;
    }
    deny('This shell command appears to use a direct network utility. Use the approved Jira MCP connection or ask the facilitator to review the action.');
    return;
  }

  output({});
}

main();
