#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from package.json
const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url)),
);

// Import commands
import init from "../src/commands/init.js";
import generateModule from "../src/commands/generate/module.js";
import generatePage from "../src/commands/generate/page.js";
import generateTheme from "../src/commands/generate/theme.js";
import generateDeploy from "../src/commands/generate/deploy.js";
import remove from "../src/commands/remove.js";
import wizard from "../src/commands/wizard.js";
import customize from "../src/commands/customize.js";

program
  .name("fsk")
  .description(
    "CLI for MERN Fullstack Starter Kit — scaffold projects and extend them",
  )
  .version(pkg.version);

// Init: create fresh project from template (always new copy)
program
  .command("init [project-name]")
  .description("Create a new project from the starter kit template")
  .option(
    "--preset <variant>",
    "Preset: saas|clinic|studio|operations|commerce|custom",
  )
  .option(
    "--theme <theme>",
    "Design theme: executiveBlue|clinicSoft|studioElevated|operationsDense|commerceWarm",
  )
  .option(
    "--layout <layout>",
    "Layout: hybridSaas|sidebarWorkspace|topbarPortal|rightRailStudio",
  )
  .option("--brand-name <name>", "Brand name")
  .option("--tagline <text>", "Brand tagline")
  .option(
    "--extra-modules <list>",
    "Comma-separated backend modules to include (e.g., users,products)",
  )
  .option(
    "--deploy-targets <list>",
    "Comma-separated deploy targets (docker,vercel,railway)",
  )
  .option("--no-install", "Skip pnpm install")
  .option("--target <dir>", "Output directory")
  .option("--force", "Overwrite existing directory")
  .action(init);

// Generate commands (inside existing project)
const generateCmd = program
  .command("generate")
  .description("Add features to existing project");

generateCmd
  .command("module <name>")
  .description(
    "Generate backend module (model, service, controller, routes, validator)",
  )
  .option("--force", "Overwrite existing files")
  .option("--fields <spec>", "Field specification")
  .option("--interactive", "Prompt for fields interactively")
  .option(
    "--architecture <level>",
    "Architecture: lightweight|moderate|advanced",
    "moderate",
  )
  .option("--with-page", "Generate corresponding frontend page")
  .action(generateModule);

generateCmd
  .command("page <name>")
  .description("Generate frontend page with route and nav entry")
  .option("--route <path>", "Custom route path")
  .option("--no-nav", "Do not add to navigation")
  .option("--icon <name>", "Icon name from lucide-react")
  .option("--force", "Overwrite existing files")
  .option("--with-form", "Generate form component")
  .option("--form-fields <spec>", "Form field specification")
  .option("--interactive", "Prompt for form fields interactively")
  .action(generatePage);

generateCmd
  .command("theme")
  .description("Import a shadcn/ui theme from CSS variables")
  .option("--file <path>", "Path to CSS file with :root/.dark")
  .option("--paste <css>", "CSS string directly")
  .option("--fallback <theme>", "Fallback theme (default: executiveBlue)")
  .option("--appearance <recipe>", "Appearance: elevated|flat|ux-heavy")
  .option("--apply", "Update app-preset.js automatically")
  .action(generateTheme);

generateCmd
  .command("deploy")
  .description("Generate deployment configs (Docker, Vercel, Railway)")
  .option("--target <provider>", "Target: docker|vercel|railway|all")
  .option("--force", "Overwrite existing files")
  .action(generateDeploy);

// Remove generated resources (safe, with confirmation)
program
  .command("remove <type> <name>")
  .description("Remove a generated page or module (with cleanup)")
  .option("--force", "Skip confirmation")
  .action(remove);

// Interactive wizard — guided setup after init or anytime
program
  .command("wizard")
  .description("Interactive guide to extend your project")
  .option("--skip-confirm", "Skip final confirmation step")
  .action(wizard);

// Customize existing project: theme/layout/brand/data
const customizeCmd = program
  .command("customize")
  .description("Customize project design & branding");

// ── Theme subcommand group ──
const themeCmd = customizeCmd.command("theme").description("Theme operations");
themeCmd
  .command("set <theme>")
  .description("Switch to a built-in theme")
  .action(customize.customizeThemeSet);
themeCmd
  .command("import")
  .description("Import a custom shadcn/ui theme from CSS")
  .option("--file <path>", "Path to CSS file with :root and .dark")
  .option("--paste <css>", "CSS string directly")
  .option("--fallback <theme>", "Fallback theme (default: executiveBlue)")
  .option("--appearance <recipe>", "Appearance recipe (default: quiet)")
  .action(customize.customizeThemeImport);

// ── Layout ──
const layoutCmd = customizeCmd
  .command("layout")
  .description("Layout operations");
layoutCmd
  .command("set <layout>")
  .description("Switch layout shell")
  .action(customize.customizeLayoutSet);

// ── Brand ──
const brandCmd = customizeCmd.command("brand").description("Brand operations");
brandCmd
  .command("set")
  .description("Update brand name and/or tagline")
  .option("--name <text>", "New brand name")
  .option("--tagline <text>", "New tagline")
  .action(customize.customizeBrandSet);

// ── Data display ──
const dataCmd = customizeCmd
  .command("data")
  .description("Data display template operations");
dataCmd
  .command("set <template>")
  .description("Switch data display template")
  .action(customize.customizeDataSet);

// ── Discovery helpers ──
customizeCmd
  .command("list-themes")
  .description("List available built-in themes")
  .action(customize.customizeListThemes);
customizeCmd
  .command("list-layouts")
  .description("List available layout shells")
  .action(customize.customizeListLayouts);
customizeCmd
  .command("list-data")
  .description("List available data display templates")
  .action(customize.customizeListData);

program.parse();
