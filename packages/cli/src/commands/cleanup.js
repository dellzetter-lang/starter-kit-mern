#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from "inquirer";

const CLEANUP_PRESETS = {
  minimal: {
    description: "Remove demo files, sample data, and branding",
    actions: ['removeDemoPages', 'replaceReadmeBranding']
  },
  production: {
    description: "Minimal + strip dev files, comments, and metadata",
    actions: ['removeDemoPages', 'replaceReadmeBranding', 'removeDevFiles', 'stripMetadata']
  },
  template: {
    description: "Create reusable project template for future projects",
    actions: ['createTemplateArchive', 'resetBranding']
  }
};

export default async function cleanupCmd(preset) {
  const spinner = ora();
  const projectRoot = process.cwd();
  
  if (!preset || !CLEANUP_PRESETS[preset]) {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "preset",
        message: "Select cleanup mode:",
        choices: Object.entries(CLEANUP_PRESETS).map(([key, val]) => ({
          name: `${key} — ${val.description}`,
          value: key
        }))
      }
    ]);
    preset = answers.preset;
  }
  
  const config = CLEANUP_PRESETS[preset];
  if (!config) {
    console.log(chalk.red(`✖ Unknown cleanup preset: "${preset}". Use one of: ${Object.keys(CLEANUP_PRESETS).join(", ")}`));
    process.exit(1);
  }
  spinner.start(`Running ${preset} cleanup...`);
  
  let removedCount = 0;
  
  for (const action of config.actions) {
    const result = await runCleanupAction(projectRoot, action, spinner);
    removedCount += result;
  }
  
  spinner.succeed(`Cleanup complete — ${removedCount} items processed`);
  console.log(chalk.green("\n✓ Project cleaned successfully"));
  printNextSteps(preset);
}

async function runCleanupAction(projectRoot, action, spinner) {
  switch (action) {
    case 'removeDemoPages':
      return await removeDemoPages(projectRoot);
    case 'replaceReadmeBranding':
      return await replaceReadmeBranding(projectRoot);
    case 'removeDevFiles':
      return await removeDevFiles(projectRoot);
    case 'stripMetadata':
      return await stripMetadata(projectRoot);
    case 'createTemplateArchive':
      return await createTemplateArchive(projectRoot);
    case 'resetBranding':
      return await resetBranding(projectRoot);
    default:
      return 0;
  }
}

async function removeDemoPages(projectRoot) {
  const demoDirs = [
    path.join(projectRoot, 'frontend/src/pages/demo'),
    path.join(projectRoot, 'frontend/src/pages/examples'),
    path.join(projectRoot, 'frontend/src/components/demo'),
  ];
  let count = 0;
  for (const dir of demoDirs) {
    if (fs.existsSync(dir)) {
      await fs.remove(dir);
      count++;
    }
  }
  return count;
}

async function findFilesRecursive(dir, predicate) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  
  const files = await fs.readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fs.stat(fullPath);
    if (stat.isDirectory()) {
      results.push(...await findFilesRecursive(fullPath, predicate));
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function removeDevFiles(projectRoot) {
  let count = 0;
  
  const frontendDir = path.join(projectRoot, 'frontend');
  const backendDir = path.join(projectRoot, 'backend');
  
  for (const cwd of [frontendDir, backendDir]) {
    if (!fs.existsSync(cwd)) continue;
    
    const testFiles = await findFilesRecursive(cwd, (f) => 
      f.endsWith('.test.js') || f.endsWith('.spec.js')
    );
    for (const file of testFiles) {
      await fs.remove(file);
      count++;
    }
    
    const testDirs = await findFilesRecursive(cwd, (f) => 
      path.basename(f) === '__tests__' && fs.statSync(f).isDirectory()
    );
    for (const dir of testDirs) {
      await fs.remove(dir);
      count++;
    }
  }
  return count;
}

async function stripMetadata(projectRoot) {
  let count = 0;
  
  const frontendDir = path.join(projectRoot, 'frontend');
  const backendDir = path.join(projectRoot, 'backend');
  
  for (const cwd of [frontendDir, backendDir]) {
    if (!fs.existsSync(cwd)) continue;
    
    const files = await findFilesRecursive(cwd, (f) => 
      f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.json')
    );
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf-8');
      let changed = false;
      
      if (content.includes('Starter Kit') || content.includes('MERN Starter')) {
        content = content
          .replace(/MERN Fullstack Starter Kit/g, 'Project')
          .replace(/MERN Starter/g, 'Project')
          .replace(/Starter Kit/g, 'Project');
        changed = true;
      }
      
      if (changed) {
        await fs.writeFile(file, content);
        count++;
      }
    }
  }
  
  return count;
}

async function replaceReadmeBranding(projectRoot) {
  const readmePath = path.join(projectRoot, 'README.md');
  if (!fs.existsSync(readmePath)) return 0;
  
  let content = await fs.readFile(readmePath, 'utf-8');
  let changed = false;
  
  if (content.includes('Starter Kit') || content.includes('MERN Starter')) {
    content = content
      .replace(/MERN Fullstack Starter Kit/g, 'Project')
      .replace(/MERN Starter/g, 'Project')
      .replace(/Starter Kit/g, 'Project');
    changed = true;
  }
  
  if (changed) {
    await fs.writeFile(readmePath, content);
  }
  
  const pkgPath = path.join(projectRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    let pkg = await fs.readJson(pkgPath);
    if (pkg.name?.includes('starter') || pkg.name?.includes('fsk')) {
      pkg.name = 'my-project';
      await fs.writeJson(pkgPath, pkg, { spaces: 2 });
    }
  }
  
  return changed ? 1 : 0;
}

async function createTemplateArchive(projectRoot) {
  const templateDir = path.join(projectRoot, '.template');
  await fs.ensureDir(templateDir);
  
  const sourcePatterns = [
    'frontend/src/components/ui',
    'frontend/src/lib',
    'backend/src/utils',
  ];
  
  for (const srcPattern of sourcePatterns) {
    const srcPath = path.join(projectRoot, srcPattern);
    if (fs.existsSync(srcPath)) {
      await fs.copy(srcPath, path.join(templateDir, srcPattern), { overwrite: true });
    }
  }
  
  return 1;
}

async function resetBranding(projectRoot) {
  const configDir = path.join(projectRoot, 'frontend/src/config');
  if (!fs.existsSync(configDir)) return 0;
  
  let count = 0;
  const files = await fs.readdir(configDir);
  
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(configDir, file);
      let content = await fs.readFile(filePath, 'utf-8');
      
      if (content.includes('brand:')) {
        const newContent = content.replace(
          /brand:\s*\{[^}]*\}/s, 
          'brand: { name: "MyProject", tagline: "Built with care" }'
        );
        if (newContent !== content) {
          await fs.writeFile(filePath, newContent);
          count++;
        }
      }
    }
  }
  
  return count;
}

function printNextSteps(preset) {
  console.log(chalk.cyan("\nNext steps:"));
  if (preset === 'template') {
    console.log(chalk.gray("  1. Review .template/ for reusable components"));
    console.log(chalk.gray("  2. Distribute template archive to your team"));
  } else {
    console.log(chalk.gray("  1. Review remaining files for customizations"));
    console.log(chalk.gray("  2. Run 'pnpm install' to update dependencies"));
    console.log(chalk.gray("  3. Test your application before deployment"));
  }
}