# Client-Safe Code

This folder is for modules that are **safe to use in browser/client-side code** (e.g., inside `.svelte` files).

🚫 Do NOT use server-only APIs such as:

- `fs`, `path`, `os`, `child_process`, etc.
- Node-specific environment access
- Any code that is not browser-compatible

✅ Do:

- Export Zod schemas, constants, types, browser-safe utilities
- Reuse shared logic that works in both environments
