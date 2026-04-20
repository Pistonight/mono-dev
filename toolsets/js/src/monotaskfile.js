// fixer for your Taskfile.yml's

import fs from "node:fs";
import { execSync } from "node:child_process";
import YAML from "js-yaml";

/** @type {Record<string, string>} */
const COMMON_DESCRIPTIONS = {
    "install-cargo-extra-tools":
        "Install or upgrade extra tools needed for development using cargo onto the system",
    setup: "One-time setup for the project",
    install: "Install or sync project dependencies",

    clean: "Remove temporary outputs",
    upgrade: "Upgrade tools and/or dependencies",

    check: "Run linters to check the code",
    fix: "Fix style issues",
    build: "Build the project",
    "build-doc": "Build the documentation",
    "doc": "Build the documentation",
    dev: "Start development server",
    "dev-doc": "Watch and serve documentation",
    "dev-app": "Watch and serve the app",
    test: "Run tests",

    release: "Publish a release",
    publish: "Publish a release",
};

/**
 * Find all non-gitignored Taskfile.yml paths under cwd
 * @returns {string[]}
 */
function find_taskfiles() {
    const output = execSync("git ls-files --cached --others --exclude-standard", {
        encoding: "utf8",
    });
    return output.split("\n").filter((f) => f === "Taskfile.yml" || f.endsWith("/Taskfile.yml"));
}

/**
 * Find the end line index (exclusive) of a task's body — lines after `  name:`
 * up to (but not including) the next top-level key at 2-space indent.
 * @param {string[]} lines
 * @param {number} taskLineIdx
 * @returns {number}
 */
function find_task_body_end(lines, taskLineIdx) {
    let end = taskLineIdx + 1;
    while (end < lines.length && !/^  \S/.test(lines[end])) {
        end++;
    }
    return end;
}

/**
 * For tasks using shorthand list syntax (`  name:\n    - cmd`), wrap the
 * commands in a `cmds:` key and optionally prepend a `desc:` line.
 * Returns the modified text, or null if the task line was not found.
 * @param {string} text
 * @param {string} name
 * @param {string | null} desc
 * @returns {string | null}
 */
function convert_shorthand_task(text, name, desc) {
    const lines = text.split("\n");
    const pattern = new RegExp(`^  ${name}\\s*:`);
    const taskIdx = lines.findIndex((l) => pattern.test(l));
    if (taskIdx === -1) return null;

    const bodyEnd = find_task_body_end(lines, taskIdx);
    const bodyLines = lines.slice(taskIdx + 1, bodyEnd);

    // Re-indent body by +2 spaces (blank lines stay blank)
    const indented = bodyLines.map((l) => (l.trim() === "" ? l : "  " + l));

    const inserted = [
        lines[taskIdx],
        ...(desc ? [`    desc: ${desc}`] : []),
        "    cmds:",
        ...indented,
    ];

    lines.splice(taskIdx, bodyEnd - taskIdx, ...inserted);
    return lines.join("\n");
}

/**
 * Insert `    desc: ...` on the line after `  name:` in the file text.
 * Returns the modified text, or null if the task line was not found.
 * @param {string} text
 * @param {string} name
 * @param {string} desc
 * @returns {string | null}
 */
function insert_desc(text, name, desc) {
    const lines = text.split("\n");
    const pattern = new RegExp(`^  ${name}\\s*:`);
    const idx = lines.findIndex((l) => pattern.test(l));
    if (idx === -1) return null;
    lines.splice(idx + 1, 0, `    desc: ${desc}`);
    return lines.join("\n");
}

/**
 * Process one Taskfile.yml. Returns true if any warnings were emitted.
 * @param {string} filepath
 * @returns {boolean}
 */
function process_file(filepath) {
    const text = fs.readFileSync(filepath, "utf8");
    const doc = /** @type {any} */ (YAML.load(text));
    const tasks = doc?.tasks;
    if (!tasks || typeof tasks !== "object") return false;

    let current_text = text;
    let had_warning = false;

    for (const [name, task] of Object.entries(tasks)) {
        if (!task || typeof task !== "object") continue;
        if (/** @type {any} */ (task).internal) continue;
        if (/** @type {any} */ (task).desc) continue;

        const desc = COMMON_DESCRIPTIONS[name];
        if (!desc) {
            console.warn(
                `[monotaskfile] ${filepath}: unknown task "${name}" — add a desc manually`,
            );
            had_warning = true;
        }

        const is_shorthand = Array.isArray(task);
        if (is_shorthand) {
            // Convert `  name:\n    - cmd` to `  name:\n    cmds:\n      - cmd`
            const updated = convert_shorthand_task(current_text, name, desc ?? null);
            if (updated === null) {
                console.warn(`[monotaskfile] ${filepath}: could not locate task "${name}" in file`);
                had_warning = true;
                continue;
            }
            console.log(
                `[monotaskfile] ${filepath}: converted shorthand for "${name}"${desc ? ` and added desc` : ""}`,
            );
            current_text = updated;
        } else if (desc) {
            const updated = insert_desc(current_text, name, desc);
            if (updated === null) {
                console.warn(`[monotaskfile] ${filepath}: could not locate task "${name}" in file`);
                had_warning = true;
                continue;
            }
            console.log(`[monotaskfile] ${filepath}: added desc for "${name}"`);
            current_text = updated;
        }
    }

    if (current_text !== text) {
        fs.writeFileSync(filepath, current_text, "utf8");
    }

    return had_warning;
}

function run_monotaskfile() {
    const files = find_taskfiles();
    if (files.length === 0) {
        console.log("[monotaskfile] no Taskfile.yml files found");
        return;
    }

    let any_warnings = false;
    for (const file of files) {
        const warned = process_file(file);
        if (warned) any_warnings = true;
    }

    if (any_warnings) {
        process.exit(1);
    }
}
run_monotaskfile();
