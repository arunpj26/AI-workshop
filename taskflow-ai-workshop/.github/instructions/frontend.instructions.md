---
description: Static HTML/CSS/JavaScript UI conventions for TaskFlow.
applyTo: "src/main/resources/static/**/*.html,src/main/resources/static/**/*.css,src/main/resources/static/**/*.js"
---
# Frontend instructions
- Keep the existing lightweight static frontend; do not add a framework unless approved.
- Use semantic HTML, accessible labels, keyboard-operable controls, and visible focus states.
- Keep CSS and JavaScript in the existing files unless a focused new file is justified.
- Avoid inline event handlers and unsafe DOM injection; prefer `textContent` for untrusted text.
- Display API errors visibly; do not silently discard failed requests.
- Keep API assumptions aligned with backend contracts.
- Do not add external CDN dependencies without approval.
- Preserve responsive layout and existing task functionality.
