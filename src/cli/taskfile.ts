// fixer for your Taskfile.yml's

import fs from "node:fs";
import { execSync } from "node:child_process";
import YAML from "js-yaml";

const COMMON_DESCRIPTIONS: Record<string, string> = {
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
    doc: "Build the documentation",
    dev: "Start development server",
    "dev-doc": "Watch and serve documentation",
    "dev-app": "Watch and serve the app",
    test: "Run tests",

    release: "Publish a release",
    publish: "Publish a release",
};

/**
 * Find all non-gitignored Taskfile.yml paths under cwd
 */
function find_taskfiles(): string[] {
    const output = execSync("git ls-files --cached --others --exclude-standard", {
        encoding: "utf8",
    });
    return output.split("\n").filter((f) => f === "Taskfile.yml" || f.endsWith("/Taskfile.yml"));
}

/**
 * Find the end line index (exclusive) of a task's body — lines after `  name:`
 * up to (but not including) the next top-level key at 2-space indent.
 */
function find_task_body_end(lines: string[], taskLineIdx: number): number {
    let end = taskLineIdx + 1;
    while (end < lines.length && !/^ {2}\S/.test(lines[end])) {
        end++;
    }
    return end;
}

/**
 * For tasks using shorthand list syntax (`  name:\n    - cmd`), wrap the
 * commands in a `cmds:` key and optionally prepend a `desc:` line.
 * Returns the modified text, or null if the task line was not found.
 */
function convert_shorthand_task(text: string, name: string, desc: string | null): string | null {
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
 */
function insert_desc(text: string, name: string, desc: string): string | null {
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
function process_file(filepath: string): boolean {
    const text = fs.readFileSync(filepath, "utf8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = YAML.load(text) as any;
    const tasks = doc?.tasks;
    if (!tasks || typeof tasks !== "object") return false;

    let current_text = text;
    let had_warning = false;

    for (const [name, task] of Object.entries(tasks)) {
        if (!task || typeof task !== "object") continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((task as any).internal) continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((task as any).desc) continue;

        const desc = COMMON_DESCRIPTIONS[name];
        if (!desc) {
            console.warn(`[mono] ${filepath}: unknown task "${name}" — add a desc manually`);
            had_warning = true;
        }

        const is_shorthand = Array.isArray(task);
        if (is_shorthand) {
            // Convert `  name:\n    - cmd` to `  name:\n    cmds:\n      - cmd`
            const updated = convert_shorthand_task(current_text, name, desc ?? null);
            if (updated === null) {
                console.warn(`[mono] ${filepath}: could not locate task "${name}" in file`);
                had_warning = true;
                continue;
            }
            console.log(
                `[mono] ${filepath}: converted shorthand for "${name}"${desc ? ` and added desc` : ""}`,
            );
            current_text = updated;
        } else if (desc) {
            const updated = insert_desc(current_text, name, desc);
            if (updated === null) {
                console.warn(`[mono] ${filepath}: could not locate task "${name}" in file`);
                had_warning = true;
                continue;
            }
            console.log(`[mono] ${filepath}: added desc for "${name}"`);
            current_text = updated;
        }
    }

    if (current_text !== text) {
        fs.writeFileSync(filepath, current_text, "utf8");
    }

    return had_warning;
}

export const runTaskfile = (): number => {
    const files = find_taskfiles();
    if (files.length === 0) {
        console.log("[mono] no Taskfile.yml files found");
        return 0;
    }

    let any_warnings = false;
    for (const file of files) {
        const warned = process_file(file);
        if (warned) any_warnings = true;
    }

    if (any_warnings) {
        return 1;
    }
    return 0;
}
