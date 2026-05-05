#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

const DESIGN_THEMES = [
  'executiveBlue',
  'clinicSoft',
  'studioElevated',
  'operationsDense',
  'commerceWarm',
];

const DESIGN_LAYOUTS = [
  'hybridSaas',
  'sidebarWorkspace',
  'topbarPortal',
  'rightRailStudio',
];

const DATA_TEMPLATES = ['dashboard', 'denseOps', 'editorial', 'commerce'];

function getPresetPath(projectRoot) {
  return path.join(projectRoot, 'frontend/src/config/app-preset.js');
}

async function ensureProject(projectRoot) {
  const presetPath = getPresetPath(projectRoot);
  if (!fs.existsSync(presetPath)) {
    console.log(chalk.red('✖  Not a MERN Starter Kit project (missing app-preset.js).'));
    process.exit(1);
  }
  return await fs.readFile(presetPath, 'utf-8');
}

// ── THEME ──
export async function customizeThemeSet(theme, _options) {
  const spinner = ora();
  const projectRoot = process.cwd();
  let presetCode = await ensureProject(projectRoot);

  if (!DESIGN_THEMES.includes(theme)) {
    console.log(chalk.red(`✖  Invalid theme. Available: ${DESIGN_THEMES.join(', ')}`));
    process.exit(1);
  }

  presetCode = presetCode.replace(/theme:\s*designThemes\.\w+/, `theme: designThemes.${theme}`);
  await fs.writeFile(getPresetPath(projectRoot), presetCode);
  spinner.succeed(`Theme set to "${theme}"`);
}

export async function customizeThemeImport(options) {
  const spinner = ora();
  const projectRoot = process.cwd();
  await ensureProject(projectRoot);

  const css = options.file
    ? (fs.existsSync(options.file) ? await fs.readFile(options.file, 'utf-8') : (console.log(chalk.red(`✖  File not found: ${options.file}`)), process.exit(1)))
    : options.paste;

  if (!css) {
    console.log(chalk.red('✖  Must provide --file <path> or --paste "<css>"'));
    process.exit(1);
  }

  const cssPath = path.join(projectRoot, 'frontend/src/config/imported-shadcn-theme.css');
  await fs.writeFile(cssPath, css);
  spinner.succeed('Theme CSS saved to frontend/src/config/imported-shadcn-theme.css');

  console.log(chalk.green('\n✓  Apply it in your app-preset.js using installShadcnDesignPreset:\n'));
  console.log(chalk.white(`import { installShadcnDesignPreset } from "@/lib/shadcn-theme";`));
  console.log(chalk.white(`import customCss from "./imported-shadcn-theme.css";`));
  console.log('');
  console.log(chalk.white(`theme: installShadcnDesignPreset(customCss, {`));
  console.log(chalk.white(`  fallback: "${options.fallback || 'executiveBlue'}",`));
  console.log(chalk.white(`  appearance: "${options.appearance || 'quiet'}"`));
  console.log(chalk.white(`});`));
}

// ── LAYOUT ──
export async function customizeLayoutSet(layout) {
  const spinner = ora();
  const projectRoot = process.cwd();
  let presetCode = await ensureProject(projectRoot);

  if (!DESIGN_LAYOUTS.includes(layout)) {
    console.log(chalk.red(`✖  Invalid layout. Available: ${DESIGN_LAYOUTS.join(', ')}`));
    process.exit(1);
  }

  presetCode = presetCode.replace(/layout:\s*designLayouts\.\w+/, `layout: designLayouts.${layout}`);
  await fs.writeFile(getPresetPath(projectRoot), presetCode);
  spinner.succeed(`Layout set to "${layout}"`);
}

// ── BRAND ──
export async function customizeBrandSet(options) {
  const spinner = ora();
  const projectRoot = process.cwd();
  let presetCode = await ensureProject(projectRoot);

  const name = options.name || options.n;
  const tagline = options.tagline || options.t;

  if (!name && !tagline) {
    console.log(chalk.red('✖  Must provide at least --name or --tagline'));
    process.exit(1);
  }

  if (name) {
    presetCode = presetCode.replace(/brand:\s*\{\s*name:\s*["'][^"']+["']/, `brand: { name: "${name}"`);
  }
  if (tagline) {
    presetCode = presetCode.replace(/tagline:\s*["'][^"']+["']/, `tagline: "${tagline}"`);
  }

  await fs.writeFile(getPresetPath(projectRoot), presetCode);
  const parts = [];
  if (name) parts.push('name=' + name);
  if (tagline) parts.push('tagline=' + tagline);
  spinner.succeed(`Brand updated (${parts.join(', ')})`);
}

// ── DATA DISPLAY ──
export async function customizeDataSet(template) {
  const spinner = ora();
  const projectRoot = process.cwd();
  let presetCode = await ensureProject(projectRoot);

  if (!DATA_TEMPLATES.includes(template)) {
    console.log(chalk.red(`✖  Invalid template. Available: ${DATA_TEMPLATES.join(', ')}`));
    process.exit(1);
  }

  presetCode = presetCode.replace(/dataDisplay:\s*dataDisplayTemplates\.\w+/, `dataDisplay: dataDisplayTemplates.${template}`);
  await fs.writeFile(getPresetPath(projectRoot), presetCode);
  spinner.succeed(`Data display template set to "${template}"`);
}

// ── LISTERS ──
export function customizeListThemes() {
  console.log(chalk.cyan('\nAvailable themes:\n'));
  DESIGN_THEMES.forEach((t) => console.log(`  ${chalk.white('•')} ${t}`));
}

export function customizeListLayouts() {
  console.log(chalk.cyan('\nAvailable layouts:\n'));
  DESIGN_LAYOUTS.forEach((l) => console.log(`  ${chalk.white('•')} ${l}`));
}

export function customizeListData() {
  console.log(chalk.cyan('\nAvailable data display templates:\n'));
  DATA_TEMPLATES.forEach((d) => console.log(`  ${chalk.white('•')} ${d}`));
}

export default {
  customizeThemeSet,
  customizeThemeImport,
  customizeLayoutSet,
  customizeBrandSet,
  customizeDataSet,
  customizeListThemes,
  customizeListLayouts,
  customizeListData,
};

