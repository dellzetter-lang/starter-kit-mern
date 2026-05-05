// Central registry for all generator functions
// Import from individual files to avoid circular deps and enable reuse (wizard, tests, etc.)

import { default as initGenerator } from '../commands/init.js';
import { default as moduleGenerator } from '../commands/generate/module.js';
import { default as pageGenerator } from '../commands/generate/page.js';
import { default as themeGenerator } from '../commands/generate/theme.js';
import { default as deployGenerator } from '../commands/generate/deploy.js';
import { default as removeCommand } from '../commands/remove.js';

// CLI command handlers
export const commands = {
  init: initGenerator,
  'generate.module': moduleGenerator,
  'generate.page': pageGenerator,
  'generate.theme': themeGenerator,
  'generate.deploy': deployGenerator,
  remove: removeCommand,
};

// Helper: invoke generator with args safely
export function invoke(command, ...args) {
  const fn = commands[command];
  if (!fn) throw new Error(`Unknown command: ${command}`);
  return fn(...args);
}
