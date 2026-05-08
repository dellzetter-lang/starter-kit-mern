#!/usr/bin/env node

import inquirer from "inquirer";
import path from "path";
import fs from "fs-extra";
import os from "os";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);

const TEMPLATE_REPO = "dellzetter-lang/starter-kit-mern";
const DEFAULT_BRANCH = "main";
const GITHUB_TAR_URL = `https://github.com/${TEMPLATE_REPO}/archive/refs/heads/${DEFAULT_BRANCH}.tar.gz`;

const PRESET_VARIANTS = [
  "saas",
  "clinic",
  "studio",
  "operations",
  "commerce",
  "custom",
];

const DESIGN_THEMES = [
  "executiveBlue",
  "clinicSoft",
  "studioElevated",
  "operationsDense",
  "commerceWarm",
];

const DESIGN_LAYOUTS = [
  "hybridSaas",
  "sidebarWorkspace",
  "topbarPortal",
  "rightRailStudio",
];

const DATA_TEMPLATES = ["dashboard", "denseOps", "editorial", "commerce"];

export default async function initCmd(projectName, options) {
  const spinner = ora({ discardStdin: false });
  
  // Commander's --no-install creates `install: true` by default, `install: false` when flag is passed
  // Interactive when: no meaningful options + install is true (default)
  const hasCustomOptions = Object.keys(options).some(
    key => key !== 'install' && options[key] !== undefined && options[key] !== false
  );
  const isInteractive = !hasCustomOptions;

  // Resolve parent output directory (--target) and project name
  let resolvedProjectName = projectName;
  let parentDir = options.target ? path.resolve(options.target) : process.cwd();

  if (isInteractive) {
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Project name:",
        default: path.basename(process.cwd()),
        validate: (input) =>
          /^[a-z0-9-_]+$/i.test(input) ||
          "Use only letters, numbers, dashes, underscores",
      },
      {
        type: "input",
        name: "parentDir",
        message: "Output parent directory:",
        default: process.cwd(),
      },
    ]);
    resolvedProjectName = answers.projectName;
    parentDir = answers.parentDir;
  } else {
    if (!resolvedProjectName) resolvedProjectName = path.basename(parentDir);
  }

  // Final destination path: parent + resolvedProjectName
  let outDir = path.join(parentDir, resolvedProjectName);

  // Ensure output dir is empty (or use --force to overwrite)
  if (fs.existsSync(outDir)) {
    if (options.force) {
      await fs.remove(outDir);
      await fs.ensureDir(outDir);
    } else {
      const files = fs.readdirSync(outDir).filter((f) => f !== "node_modules");
      if (files.length > 0) {
        console.log(
          chalk.yellow(`⚠  Directory ${outDir} exists and is not empty.`),
        );
        if (isInteractive) {
          const { confirm } = await inquirer.prompt([
            {
              type: "confirm",
              name: "confirm",
              message: "Continue and overwrite?",
              default: false,
            },
          ]);
          if (!confirm) {
            console.log(chalk.gray("✖  cancelled."));
            process.exit(0);
          }
          // User confirmed — clear the directory
          await fs.remove(outDir);
          await fs.ensureDir(outDir);
        } else {
          console.log(
            chalk.red(
              "Directory exists and is not empty. Use --force or choose an empty directory.",
            ),
          );
          process.exit(1);
        }
      }
    }
  }

  // Step 2: Interactive questions (if not provided via CLI flags)
  let answers = { ...options };

  if (isInteractive) {
    answers = await inquirer.prompt([
      {
        type: "list",
        name: "preset",
        message: "Choose a preset variant:",
        choices: PRESET_VARIANTS,
        default: answers.preset || "saas",
      },
      {
        type: "input",
        name: "brandName",
        message: "Brand name:",
        default: (prev) => {
          const presets = {
            saas: "MERN Starter",
            clinic: "CareDesk",
            studio: "StudioBoard",
            operations: "OpsGrid",
            commerce: "MarketPilot",
          };
          return presets[prev.preset] || "MyApp";
        },
      },
      {
        type: "input",
        name: "tagline",
        message: "Tagline:",
        default: (prev) => {
          const presets = {
            saas: "Secure app foundation",
            clinic: "Clinic operations kit",
            studio: "Creative production hub",
            operations: "Internal operations console",
            commerce: "Commerce admin starter",
          };
          return presets[prev.preset] || "Build something great";
        },
      },
      {
        type: "list",
        name: "theme",
        message: "Design theme:",
        choices: DESIGN_THEMES,
        default: (prev) => {
          const presets = {
            saas: "operationsDense",
            clinic: "clinicSoft",
            studio: "studioElevated",
            operations: "operationsDense",
            commerce: "commerceWarm",
          };
          return presets[prev.preset] || "executiveBlue";
        },
      },
      {
        type: "list",
        name: "layout",
        message: "Layout shell:",
        choices: DESIGN_LAYOUTS,
        default: (prev) => {
          const presets = {
            saas: "topbarPortal",
            clinic: "sidebarWorkspace",
            studio: "rightRailStudio",
            operations: "sidebarWorkspace",
            commerce: "topbarPortal",
          };
          return presets[prev.preset] || "hybridSaas";
        },
      },
      {
        type: "list",
        name: "dataDisplay",
        message: "Responsive data template:",
        choices: DATA_TEMPLATES,
        default: (prev) => {
          const presets = {
            saas: "dashboard",
            clinic: "dashboard",
            studio: "editorial",
            operations: "denseOps",
            commerce: "commerce",
          };
          return presets[prev.preset] || "dashboard";
        },
      },
      {
        type: "list",
        name: "architecture",
        message: "Architecture level for generated modules:",
        choices: [
          { name: "Lightweight — inline controller, minimal files (controllers in routes)", value: "lightweight" },
          { name: "Moderate — full layer separation (service/controller/routes)", value: "moderate" },
          { name: "Advanced — with tests, domain logic, middleware", value: "advanced" },
        ],
        default: "moderate",
      },
      {
        type: "checkbox",
        name: "extraModules",
        message: "Select common backend modules to include (besides auth):",
        choices: [
          {
            name: "users (admin user management)",
            value: "users",
            checked: true,
          },
          { name: "products (CRUD scaffold)", value: "products" },
          { name: "invoices (billing scaffold)", value: "invoices" },
        ],
      },
      {
        type: "checkbox",
        name: "deployTargets",
        message: "Select deployment configurations to generate:",
        choices: [
          { name: "Docker (Dockerfile + docker-compose)", value: "docker" },
          { name: "Vercel (vercel.json)", value: "vercel" },
          { name: "Railway (railway.yaml)", value: "railway" },
        ],
      },
      {
        type: "confirm",
        name: "installDeps",
        message: "Run pnpm install after scaffolding?",
        default: true,
      },
    ]);
  } else {
    // Apply defaults based on preset if specific fields missing
    const presets = {
      saas: {
        theme: "operationsDense",
        layout: "topbarPortal",
        brandName: "MERN Starter",
        tagline: "Secure app foundation",
      },
      clinic: {
        theme: "clinicSoft",
        layout: "sidebarWorkspace",
        brandName: "CareDesk",
        tagline: "Clinic operations kit",
      },
      studio: {
        theme: "studioElevated",
        layout: "rightRailStudio",
        brandName: "StudioBoard",
        tagline: "Creative production hub",
      },
      operations: {
        theme: "operationsDense",
        layout: "sidebarWorkspace",
        brandName: "OpsGrid",
        tagline: "Internal operations console",
      },
      commerce: {
        theme: "commerceWarm",
        layout: "topbarPortal",
        brandName: "MarketPilot",
        tagline: "Commerce admin starter",
      },
    };
    const preset = answers.preset || "saas";
    answers.brandName = answers.brandName || presets[preset].brandName;
    answers.tagline = answers.tagline || presets[preset].tagline;
    answers.theme = answers.theme || presets[preset].theme;
    answers.layout = answers.layout || presets[preset].layout;
    answers.dataDisplay = answers.dataDisplay || "dashboard";
    // Parse comma-separated lists into arrays
    if (typeof answers.extraModules === "string") {
      answers.extraModules = answers.extraModules
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      answers.extraModules = answers.extraModules || [];
    }
    if (typeof answers.deployTargets === "string") {
      answers.deployTargets = answers.deployTargets
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      answers.deployTargets = answers.deployTargets || [];
    }
    answers.installDeps = answers.installDeps !== false;
    answers.architecture = answers.architecture || "moderate";
  }

  // Step 3: Download template
  spinner.start("Downloading starter kit template...");
  const tempDir = path.join(os.tmpdir(), `fsk-${Date.now()}`);
  await fs.ensureDir(tempDir);

  try {
    // Use degit via fetch + extract
    await downloadTemplate(tempDir, spinner);
    spinner.succeed("Template downloaded");
  } catch (err) {
    spinner.fail("Failed to download template");
    console.error(chalk.red(err.message));
    process.exit(1);
  }

   // Step 4: Copy template to destination
   spinner.start("Copying project files...");
   await fs.copy(tempDir, outDir);
   await fs.remove(tempDir);
  spinner.succeed("Project files copied");

  // Step 5: Apply customizations
  spinner.start("Customizing configuration...");
  await applyPresetCustomization(path.join(outDir), answers);
  spinner.succeed("Configuration customized");

// Step 6: Generate extra backend modules
   if (answers.extraModules?.length) {
     spinner.start("Generating backend modules...");
     for (const mod of answers.extraModules) {
       await generateBackendModule(path.join(outDir), mod, answers.architecture);
     }
     spinner.succeed(`Generated ${answers.extraModules.length} module(s)`);
   }

  // Step 7: Generate deployment configs
  if (answers.deployTargets?.length) {
    spinner.start("Generating deployment configs...");
    for (const target of answers.deployTargets) {
      await generateDeployConfig(path.join(outDir), target);
    }
    spinner.succeed(
      `Generated ${answers.deployTargets.length} deployment config(s)`,
    );
  }

  // Step 8: Optional dependency installation
  if (answers.installDeps) {
    spinner.stop();  // stop spinner so pnpm output is clearly visible
    console.log(chalk.cyan("━> Installing dependencies with pnpm..."));
    try {
      execSync("pnpm install", {
        cwd: outDir,
        stdio: "inherit",  // stream pnpm output live
        env: { ...process.env, PNPM_HOME: "", CI: "true" },
      });
      spinner.succeed("Dependencies installed");
    } catch (err) {
      spinner.warn(
        "Dependency installation failed — you can run `pnpm install` manually",
      );
    }
  }

  // Step 9: Success message
  console.log("");
  console.log(chalk.green.bold("✨ Project created!"));
  console.log("");
  console.log(chalk.white(`  cd ${resolvedProjectName}`));
  console.log(chalk.white(`  pnpm dev`));
  console.log("");
  console.log(chalk.gray("Next steps:"));
  console.log(
    chalk.gray("  1. Update .env files with your MongoDB URI and secrets"),
  );
  console.log(chalk.gray("  2. Run pnpm dev to start the dev server"));
  console.log(
    chalk.gray("  3. Visit http://localhost:5173 and http://localhost:5000"),
  );
  console.log("");
}

// ─── Helpers ────────────────────────────────────────────

async function downloadTemplate(destDir) {
  const { createGunzip } = await import("zlib");
  const { pipeline } = await import("stream");
  const https = await import("https");
  const { extract } = await import("tar");

  return new Promise((resolve, reject) => {
    https
      .get(GITHUB_TAR_URL, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirectUrl = res.headers.location;
          if (redirectUrl) {
            https
              .get(redirectUrl, (res2) => {
                if (res2.statusCode !== 200) {
                  return reject(
                    new Error(`HTTP ${res2.statusCode} after redirect`),
                  );
                }
                pipeline(
                  res2.pipe(createGunzip()),
                  extract({ cwd: destDir, strip: 1 }),
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  },
                );
              })
              .on("error", reject);
            return;
          }
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        pipeline(
          res.pipe(createGunzip()),
          extract({ cwd: destDir, strip: 1 }),
          (err) => {
            if (err) reject(err);
            else resolve();
          },
        );
      })
      .on("error", reject);
  });
}

async function applyPresetCustomization(projectRoot, answers) {
  const presetPath = path.join(
    projectRoot,
    "frontend/src/config/app-preset.js",
  );
  let presetCode = await fs.readFile(presetPath, "utf-8");

  // Determine new preset value
  let newPreset;
  if (answers.preset === "custom") {
    // Build a complete custom preset object
    newPreset = `{
  ...baseContent,
  brand: { name: "${answers.brandName}", tagline: "${answers.tagline}" },
  layout: designLayouts.${answers.layout},
  theme: designThemes.${answers.theme},
  dataDisplay: dataDisplayTemplates.${answers.dataDisplay || "dashboard"},
  landing: {
    badge: "Custom build",
    title: "${answers.brandName}",
    description: "${answers.tagline}",
    primaryCta: "Get started",
    secondaryCta: "Learn more",
  },
  dashboardCards: [
    { title: "Welcome", description: "Customize your dashboard." },
  ],
}`;
  } else {
    // Select named preset from presetVariants
    newPreset = `presetVariants.${answers.preset}`;
  }

  // Replace the export line at bottom
  presetCode = presetCode.replace(
    /export const appPreset = .+;/,
    `export const appPreset = ${newPreset};`,
  );

  await fs.writeFile(presetPath, presetCode, "utf-8");

  // Update README if project name differs from default
  const readmePath = path.join(projectRoot, "README.md");
  let readme = await fs.readFile(readmePath, "utf-8");
  readme = readme.replace(/MERN Fullstack Starter Kit/g, answers.brandName);
  readme = readme.replace(/MERN Starter/g, answers.brandName);
  await fs.writeFile(readmePath, readme, "utf-8");
}

async function generateBackendModule(projectRoot, moduleName, archLevel = "moderate") {
   // Delegate to the generateModuleFiles function logic from module.js
   const { frontendDir, backendDir } = { frontendDir: "frontend", backendDir: "backend" };
   const fields = [{ 
     name: "name", 
     type: "string", 
     validation: { required: true, minLength: 3, maxLength: 100 },
     label: "Name"
   }];
   
   const pascalName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
   const modDir = path.join(projectRoot, backendDir, "src/modules", moduleName);
   await fs.ensureDir(modDir);

   const schemaFields = fields.map(f => {
     let def = `${f.name}: { type: `;
     switch (f.type) {
       case "number": def += "Number"; break;
       case "boolean": def += "Boolean"; break;
       case "date": def += "Date"; break;
       default: def += "String";
     }
     const constraints = [];
     if (f.validation?.required) constraints.push("required: true");
     if (["string", "text", "email", "phone"].includes(f.type)) constraints.push("trim: true");
     if (f.validation?.minLength) constraints.push(`minlength: ${f.validation.minLength}`);
     if (f.validation?.maxLength) constraints.push(`maxlength: ${f.validation.maxLength}`);
     if (constraints.length > 0) def += `, ${constraints.join(", ")}`;
     return def + " }";
   }).join(",\n    ");

   const modelTpl = `const mongoose = require("mongoose");

const ${moduleName}Schema = new mongoose.Schema(
  {
    ${schemaFields}
  },
  { timestamps: true }
);

module.exports = mongoose.model("${pascalName}", ${moduleName}Schema);
`;

   const serviceTpl = `const ${moduleName}Model = require("./${moduleName}.model");
const ApiError = require("../../utils/ApiError");

const create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async (payload) => {
  // TODO: Implement business logic
  const doc = await ${moduleName}Model.create(payload);
  return doc;
};

const getAll${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s = async () => {
  return await ${moduleName}Model.find({});
};

const get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}ById = async (id) => {
  const doc = await ${moduleName}Model.findById(id);
  if (!doc) throw new ApiError(404, "${moduleName} not found");
  return doc;
};

const update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async (id, updates) => {
  const doc = await ${moduleName}Model.findByIdAndUpdate(id, updates, { new: true });
  if (!doc) throw new ApiError(404, "${moduleName} not found");
  return doc;
};

const delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)} = async (id) => {
  const doc = await ${moduleName}Model.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "${moduleName} not found");
  return doc;
};

module.exports = {
  create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)},
  getAll${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s,
  get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}ById,
  update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)},
  delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)},
};
`;

  const controllerTpl = `const service = require("./${moduleName}.service");
const ApiResponse = require("../../utils/ApiResponse");

const create = async (req, res, next) => {
  try {
    const result = await service.create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}(req.body);
    return res.status(201).json(new ApiResponse(201, "${moduleName} created", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await service.getAll${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}s();
    return res.status(200).json(new ApiResponse(200, "Fetched all", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await service.get${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}ById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Fetched", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await service.update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Updated", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.delete${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Deleted").body);
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, list, getOne, update, remove };
`;

  const routesTpl = `const express = require("express");
const controller = require("./${moduleName}.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/auth.middleware").authenticate;
const requireRole = require("../../middlewares/auth.middleware").requireRole;

const router = express.Router();

// Public access example (no auth):
// router.get("/", controller.list);

// Protected routes:
router.post("/", authenticate, controller.create);
router.get("/", authenticate, controller.list);
router.get("/:id", authenticate, controller.getOne);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, requireRole("admin"), controller.remove);

module.exports = router;
`;

  const validatorTpl = `const Joi = require("joi");

const create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Schema = Joi.object({
  name: Joi.string().trim().required(),
});

const update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Schema = create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Schema.fork(
  ["name"],
  (schema) => schema.optional()
);

module.exports = {
  create${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Schema,
  update${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Schema,
};
`;

  await fs.ensureDir(modDir);
  await fs.writeFile(path.join(modDir, `${moduleName}.model.js`), modelTpl);
  await fs.writeFile(path.join(modDir, `${moduleName}.service.js`), serviceTpl);
  await fs.writeFile(
    path.join(modDir, `${moduleName}.controller.js`),
    controllerTpl,
  );
  await fs.writeFile(path.join(modDir, `${moduleName}.routes.js`), routesTpl);
  await fs.writeFile(
    path.join(modDir, `${moduleName}.validator.js`),
    validatorTpl,
  );

  // Mount in routes index.js
  const routesIndexPath = path.join(projectRoot, "backend/src/routes/index.js");
  const routesCode = await fs.readFile(routesIndexPath, "utf-8");
  const mountLine = `router.use("/${moduleName}", require("../modules/${moduleName}/${moduleName}.routes"));`;

  if (!routesCode.includes(mountLine)) {
    await fs.writeFile(
      routesIndexPath,
      routesCode.replace(
        "module.exports = router;",
        `${mountLine}\nmodule.exports = router;`,
      ),
    );
  }
}

async function generateDeployConfig(projectRoot, target) {
  switch (target) {
    case "docker": {
      const dockerfile = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE 5000
CMD ["node", "backend/server.js"]
`;
      const dc = `version: '3.8'
services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=\${MONGODB_URI}
      - JWT_ACCESS_SECRET=\${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=\${JWT_REFRESH_SECRET}
    env_file:
      - .env
`;
      await fs.writeFile(path.join(projectRoot, "Dockerfile"), dockerfile);
      await fs.writeFile(path.join(projectRoot, "docker-compose.yml"), dc);
      break;
    }
    case "vercel": {
      const vercelJson = {
        version: 2,
        builds: [
          {
            src: "frontend/package.json",
            use: "@vercel/static-build",
            config: { distDir: "dist" },
          },
          { src: "backend/package.json", use: "@vercel/node" },
        ],
        routes: [
          { src: "/api/(.*)", dest: "/backend/server.js" },
          { handle: "filesystem" },
          { src: "/(.*)", dest: "/frontend/index.html" },
        ],
      };
      await fs.writeFile(
        path.join(projectRoot, "vercel.json"),
        JSON.stringify(vercelJson, null, 2),
      );
      break;
    }
    case "railway": {
      const railwayYaml = `{
  "build": {
    "builder": "NIXPACKS",
    "env": {
      "NODE_VERSION": "20"
    }
  },
  "deploy": {
    "startCommand": "pnpm start",
    "restartPolicy": {
      "policy": "ON_FAILURE",
      "delayMs": 5000
    }
  }
}
`;
      await fs.writeFile(path.join(projectRoot, "railway.yaml"), railwayYaml);
      break;
    }
  }
}
