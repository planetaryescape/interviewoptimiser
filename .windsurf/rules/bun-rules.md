---
trigger: model_decision
description: If you ever need to do anything with bun then first ALWAYS read this rule because it has special instructions for how we use bun in this project
globs:
---
- Bun has it's own test command, so when you want to run the test script in package.json, please use `bun run test ...` and not `bun test ...`
- When running tests with bun, remember that bun has it's own `bun test` command, so if you want to use the test script from package.json then use `bun run test` so that you use the correct command.
- Node package installation snippets should use bun where possible.