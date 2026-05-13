#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

export default async function generatePageCmd(name, options) {
  const spinner = ora();
  const projectRoot = process.cwd();

  if (!fs.existsSync(path.join(projectRoot, 'frontend/src/App.jsx'))) {
    console.log(chalk.red('✖  Not a MERN Starter Kit frontend.'));
    process.exit(1);
  }

  const pageName = name.charAt(0).toUpperCase() + name.slice(1);
  const pageDir = path.join(projectRoot, 'frontend/src/pages', name);
  const pageFile = path.join(pageDir, `${pageName}Page.jsx`);

  if (fs.existsSync(pageFile)) {
    if (options.force) {
      spinner.warn(`${pageFile} exists — will overwrite (--force)`);
    } else {
      console.log(chalk.yellow(`⚠  Page ${pageName} already exists. Use --force to overwrite.`));
      process.exit(1);
    }
  }

  await fs.ensureDir(pageDir);
  const pageTpl = `import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/utils/constants";
import { PageWrapper } from "@/components/layout/PageWrapper";
export default function ${pageName}Page() {
  const { user } = useAuth();

  return (
     <PageWrapper className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {user?.name}. {preset.brand.tagline}.</p>
      </section>
      </PageWrapper>
  );
}
`;
  await fs.writeFile(pageFile, pageTpl);
  spinner.succeed(`Created page: ${pageFile}`);

  // Add lazy import for the page component at the top of AppRouter.jsx
  const routerPath = path.join(projectRoot, 'frontend/src/routes/AppRouter.jsx');
  if (fs.existsSync(routerPath)) {
    let routerCode = await fs.readFile(routerPath, 'utf-8');
    const importLine = `const ${pageName}Page = lazy(() => import("@/pages/${name}/${pageName}Page"));`;

    if (routerCode.includes(importLine)) {
      console.log(chalk.gray('ℹ  Import already exists'));
    } else {
      const pageImportRegex = /^const \w+Page = lazy\(.*?\);/gm;
      let lastMatch, match;
      while ((match = pageImportRegex.exec(routerCode)) !== null) {
        lastMatch = match;
      }
      if (lastMatch) {
        routerCode = routerCode.replace(
          lastMatch[0],
          `${lastMatch[0]}\n${importLine}`
        );
      } else {
        routerCode = routerCode.replace(
          'export function AppRouter()',
          `${importLine}\nexport function AppRouter()`
        );
      }
      await fs.writeFile(routerPath, routerCode);
      spinner.succeed('Added lazy import to AppRouter.jsx');
      // Reload for route insertion below
      routerCode = await fs.readFile(routerPath, 'utf-8');
    }

    // Add route to AppRouter.jsx (place BEFORE wildcard "404" route so it remains last)
    const routePath = options.route || `/${name}`;
    // Build insertion block with proper indentation
    const routeBlock = `${pageName}Page`;
    const routeInsert = `\n      {/* ${pageName} */}
      <Route
        path="${routePath}"
        element={<AppShell secure><${routeBlock} /></AppShell>}
      />`;

    if (routerCode.includes(`path="${routePath}"`)) {
      console.log(chalk.gray('ℹ  Route already exists'));
    } else {
      // Try to insert right before the wildcard (NotFound) route to keep it last
      const wildcardRegex = /^(\s*)<Route\s+path="\*"\s+element=.*?\/>/m;
      const wildcardMatch = routerCode.match(wildcardRegex);
      if (wildcardMatch) {
        const indent = wildcardMatch[1];
        // Build block with same indent as other routes
        const indentedInsert = `\n${indent}  {/* ${pageName} */}
${indent}  <Route
${indent}    path="${routePath}"
${indent}    element={<AppShell secure><${routeBlock} /></AppShell>}
${indent}  />`;
        routerCode = routerCode.replace(wildcardRegex, indentedInsert + '\n' + wildcardMatch[0]);
      } else {
        // No wildcard found — insert before </Routes>
        routerCode = routerCode.replace('</Routes>', `${routeInsert}\n      </Routes>`);
      }
      await fs.writeFile(routerPath, routerCode);
      spinner.succeed('Added route to AppRouter.jsx');
    }
  } else {
    console.log(chalk.yellow('⚠  AppRouter.jsx not found — add route manually.'));
  }

  // Add nav entry unless --no-nav
  if (!options.noNav) {
    const presetPath = path.join(projectRoot, 'frontend/src/config/app-preset.js');
    if (fs.existsSync(presetPath)) {
      let presetCode = await fs.readFile(presetPath, 'utf-8');
      const routePath = options.route || `/${name}`;
      const navEntry = `{ label: "${pageName}", href: "${routePath}", icon: "${options.icon || 'layout'}" },`;

      if (presetCode.includes(`href: "${routePath}"`)) {
        console.log(chalk.gray('ℹ  Navigation entry already present'));
      } else {
        const navMatch = presetCode.match(/navigation:\s*\[([\s\S]*?)\]/);
        if (!navMatch) {
          console.log(chalk.yellow('⚠  Could not find navigation array — skipping'));
        } else {
          let existingItems = navMatch[1].trim();
          const cleaned = existingItems.replace(/,\s*$/, '');
          const newItems = cleaned ? `${cleaned},\n      ${navEntry}` : navEntry;
          const replacement = `navigation: [\n      ${newItems}\n    ]`;
          presetCode = presetCode.replace(/navigation:\s*\[[\s\S]*?\]/, replacement);
          await fs.writeFile(presetPath, presetCode);
          spinner.succeed('Added navigation entry to app-preset.js');
        }
      }
    } else {
      console.log(chalk.yellow('⚠  app-preset.js not found — add nav manually.'));
    }
  }
}
