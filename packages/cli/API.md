# CLI Extension API

This document describes the public interfaces and hooks available for extending the CLI via plugins or programmatic usage.

## 1. Plugin System

Plugins allow you to register new commands or modify existing behavior without touching the core codebase.

### Registration

Create a file in `.fsk/plugins/my-plugin.js`:

```javascript
/**
 * @param {import('commander').Command} program - The global Commander instance
 */
export function register(program) {
  program
    .command("my-feature")
    .description("A custom plugin feature")
    .action(() => {
      console.log("Plugin executed!");
    });
}
```

## 2. Programmatic Usage

You can import the core classes to build your own generation flows.

### Generator Class

The `Generator` class is the main engine for file production and idempotency.

```javascript
import { Generator } from "@fullstack-starter/cli/core/generator";

const gen = new Generator({
  projectRoot: process.cwd(),
  architecture: "advanced", // lightweight | moderate | advanced
  stealth: true,
  withTests: true,
});

const result = await gen.generateFromDefinition(resourceDef);
```

### ResourceDefinition Class

Unified schema for describing domain resources.

```javascript
import { ResourceDefinition } from "@fullstack-starter/cli/core/resource-definition";

const product = new ResourceDefinition({
  name: "Product",
  fields: [
    { name: "title", type: "string", validation: { required: true } },
    { name: "price", type: "number", validation: { min: 0 } },
  ],
});
```

## 3. Lifecycle Hooks

The CLI uses Commander.js hooks for global behaviors.

- **preAction**: Logic to run before any command (e.g., config loading).
- **postAction**: Logic to run after a command finishes (e.g., JSON output processing).

## 4. Configuration (.fskrc.json)

Settings can be persisted in a configuration file:

```json
{
  "init": {
    "preset": "saas",
    "theme": "executiveBlue"
  },
  "makeResource": {
    "arch": "advanced",
    "withTests": true
  }
}
```
