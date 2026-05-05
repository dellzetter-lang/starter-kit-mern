#!/usr/bin/env node

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';

export default async function generateModuleCmd(name, options) {
  const spinner = ora();
  const projectRoot = process.cwd();

  // Verify this is a starter kit project
  if (!fs.existsSync(path.join(projectRoot, 'backend/src/modules/auth'))) {
    console.log(chalk.red('✖  Not a MERN Starter Kit backend (no modules/auth directory).'));
    process.exit(1);
  }

  const modDir = path.join(projectRoot, 'backend/src/modules', name);
  if (fs.existsSync(modDir)) {
    if (options.force) {
      spinner.warn(`Module ${name} exists — overwriting (--force)`);
    } else {
      console.log(chalk.yellow(`⚠  Module ${name} exists. Use --force to overwrite.`));
      process.exit(1);
    }
  }

  await fs.ensureDir(modDir);

  const U = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const Upper = s => U(s);

  const modelTpl = `const mongoose = require("mongoose");
const { env } = require("../../config/env");

const ${name}Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // TODO: add fields
  },
  { timestamps: true }
);

module.exports = mongoose.model("${Upper(name)}", ${name}Schema);
`;

  const serviceTpl = `const ${name}Model = require("./${name}.model");
const ApiError = require("../../utils/ApiError");

const create = async (payload) => {
  return await ${name}Model.create(payload);
};

const list = async () => {
  return await ${name}Model.find({});
};

const getById = async (id) => {
  const doc = await ${name}Model.findById(id);
  if (!doc) throw new ApiError(404, "${name} not found");
  return doc;
};

const update = async (id, updates) => {
  return await ${name}Model.findByIdAndUpdate(id, updates, { new: true });
};

const remove = async (id) => {
  const doc = await ${name}Model.findByIdAndDelete(id);
  if (!doc) throw new ApiError(404, "${name} not found");
  return doc;
};

module.exports = { create, list, getById, update, remove };
`;

  const controllerTpl = `const service = require("./${name}.service");
const ApiResponse = require("../../utils/ApiResponse");

const create = async (req, res, next) => {
  try {
    const result = await service.create(req.body);
    return res.status(201).json(new ApiResponse(201, "Created", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const list = async (req, res, next) => {
  try {
    const result = await service.list();
    return res.status(200).json(new ApiResponse(200, "Fetched", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const getOne = async (req, res, next) => {
  try {
    const result = await service.getById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Fetched", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await service.update(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Updated", { data: result }).body);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Deleted").body);
  } catch (err) {
    return next(err);
  }
};

module.exports = { create, list, getOne, update, remove };
`;

  const routesTpl = `const express = require("express");
const controller = require("./${name}.controller");
const validate = require("../../middlewares/validate");
const authenticate = require("../../middlewares/auth.middleware").authenticate;

const router = express.Router();

router.post("/", authenticate, controller.create);
router.get("/", authenticate, controller.list);
router.get("/:id", authenticate, controller.getOne);
router.put("/:id", authenticate, controller.update);
router.delete("/:id", authenticate, controller.remove);

module.exports = router;
`;

  const validatorTpl = `const Joi = require("joi");

const createSchema = Joi.object({
  name: Joi.string().trim().required(),
});

const updateSchema = createSchema.fork(["name"], (s) => s.optional());

module.exports = { createSchema, updateSchema };
`;

  await fs.writeFile(path.join(modDir, `${name}.model.js`), modelTpl);
  await fs.writeFile(path.join(modDir, `${name}.service.js`), serviceTpl);
  await fs.writeFile(path.join(modDir, `${name}.controller.js`), controllerTpl);
  await fs.writeFile(path.join(modDir, `${name}.routes.js`), routesTpl);
  await fs.writeFile(path.join(modDir, `${name}.validator.js`), validatorTpl);

  spinner.succeed(`Module backend/${name} scaffolded`);

  // Mount in routes index
  const routesIndexPath = path.join(projectRoot, 'backend/src/routes/index.js');
  if (fs.existsSync(routesIndexPath)) {
    const code = await fs.readFile(routesIndexPath, 'utf-8');
    const mountLine = `router.use("/${name}", require("../modules/${name}/${name}.routes"));`;
    if (code.includes(mountLine)) {
      console.log(chalk.gray(`ℹ  routes/index.js already has mount for /${name}`));
    } else {
      await fs.writeFile(
        routesIndexPath,
        code.replace('module.exports = router;', `${mountLine}\nmodule.exports = router;`)
      );
      spinner.succeed(`Mounted ${name} routes at /api/${name}`);
    }
  } else {
    console.log(chalk.yellow('⚠  Could not find backend/src/routes/index.js — remember to mount your module.'));
  }
}
