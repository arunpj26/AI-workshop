'use strict';

// Workshop demo: runs before Copilot uses a tool and logs ONLY the tool name.
const fs = require('node:fs');
const path = require('node:path');

const LOG_FILE = path.join(__dirname, 'tool-use.log');

try {
  // Copilot sends event details as JSON on stdin.
  const event = JSON.parse(fs.readFileSync(0, 'utf8'));
  const rawName = event.tool_name || event.toolName || 'unknown';

  // Keep only safe characters so nothing else can end up in the log.
  const toolName = String(rawName).replace(/[^\w.\-]/g, '_').slice(0, 100);

  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} ${toolName}\n`);
} catch {
  // A logging problem must never block Copilot.
}

// Empty output = "no opinion"; the tool call proceeds normally.
process.stdout.write('{}');
