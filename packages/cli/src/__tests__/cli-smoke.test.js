import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import os from "os";

const CLI_PATH = path.resolve(__dirname, "../../bin/cli.js");
const TEMP_DIR = path.join(os.tmpdir(), "fsk-test-" + Date.now());

describe("FSK CLI Smoke Tests", () => {
  beforeAll(async () => {
    await fs.ensureDir(TEMP_DIR);
  });

  afterAll(async () => {
    await fs.remove(TEMP_DIR);
  });

  it("should show version", () => {
    const output = execSync(`node ${CLI_PATH} --version`).toString();
    expect(output).toMatch(/\d+\.\d+\.\d+/);
  });

  it("should show help", () => {
    const output = execSync(`node ${CLI_PATH} --help`).toString();
    expect(output).toContain("Usage: fsk");
    expect(output).toContain("init");
    expect(output).toContain("generate");
  });

  it("should fail when running doctor outside project", () => {
    try {
      execSync(`node ${CLI_PATH} doctor`, { cwd: TEMP_DIR });
    } catch (err) {
      expect(err.stdout.toString()).toContain("Not a MERN Starter Kit project");
    }
  });
});
