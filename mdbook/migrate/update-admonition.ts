import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const WRITE_BEFORE = false;

const TYPE_MAP: Record<string, string> = {
    note: "NOTE",
    tip: "TIP",
    hint: "TIP",
    important: "IMPORTANT",
    warning: "WARNING",
    attention: "WARNING",
    caution: "CAUTION",
};

/** Parsed components of a fenced code block opening line. */
interface FenceInfo {
    /** Leading spaces before the fence chars. */
    indent: string;
    /** The fence character: `` ` `` for backtick fences, `~` for tilde fences. */
    fenceChar: string;
    /** Number of fence chars (>= 3). The closing fence must use >= this many. */
    fenceLen: number;
    /** Everything after the fence chars on the same line (the info string). */
    rest: string;
}

/** Parsed opening line of an `admonish` fenced block. */
interface AdmonishOpening {
    /** Leading spaces — preserved on all output lines for this block. */
    indent: string;
    /** Fence character (`` ` `` or `~`), used to identify the matching closing fence. */
    fenceChar: string;
    /** Number of fence chars in the opening, used to identify the matching closing fence. */
    fenceLen: number;
    /** Everything after `admonish` on the opening line, trimmed (e.g. `"warning"` or `"note title=\"x\""`). */
    optionsStr: string;
}

/** Result of parsing the options string from an admonish opening line. */
type ParseResult =
    /** The mapped mdBook builtin type name (e.g. `"NOTE"`). */
    | { ok: true; mdBookType: string }
    /** Human-readable error message describing why the block cannot be converted. */
    | { ok: false; error: string };

/** A conversion error tied to a specific line in a source file. */
interface BlockError {
    /** 1-indexed line number of the admonish opening fence that could not be converted. */
    line: number;
    /** Human-readable reason the block was left unconverted. */
    message: string;
}

const main = () => {
    const dir = process.argv[2];
    if (!dir) {
        console.error("usage: update-admonition.ts <directory>");
        process.exit(1);
    }

    const resolvedDir = resolve(dir);
    const files = findMarkdownFiles(resolvedDir);

    if (files.length === 0) {
        console.log(">>> no markdown files found.");
        return;
    }
    console.log(">>> processing " + files.length + "files")

    let convertedCount = 0;
    let skippedCount = 0;
    let unchangedCount = 0;
    const allErrors: Array<{ file: string; line: number; message: string }> =
        [];

    for (const file of files) {
        const original = readFileSync(file, "utf-8");
        const { output, errors } = processLines(original.split("\n"));

        if (errors.length > 0) {
            for (const err of errors) {
                allErrors.push({ file, ...err });
            }
            skippedCount++;
            continue;
        }

        const converted = output.join("\n");
        if (converted === original) {
            unchangedCount++;
            continue;
        }

        if (WRITE_BEFORE) {
            // Save original as .before so the user can inspect the diff.
            writeFileSync(file + ".before", original);
        }
        writeFileSync(file, converted);
        convertedCount++;
    }

    if (allErrors.length > 0) {
        console.error("\nerrors (these files were NOT modified):");
        for (const err of allErrors) {
            console.error(`  ${err.file}:${err.line}: ${err.message}`);
        }
        console.error(
            `\n${skippedCount} file(s) skipped — fix errors and re-run.`,
        );
    }

    if (convertedCount > 0) {
        console.log(`\n>>> converted ${convertedCount} file(s).`);
    }
    if (unchangedCount > 0) {
        console.log(`>>> ${unchangedCount} file(s) unchanged (no admonish blocks).`);
    }

    if (allErrors.length > 0) process.exit(1);
};

const findMarkdownFiles = (dir: string): string[] => {
    const SKIP_DIRS = new Set(["book", "node_modules", ".git"]);
    const files: string[] = [];

    const recurse = (current: string) => {
        for (const entry of readdirSync(current, { withFileTypes: true })) {
            if (entry.isDirectory()) {
                if (!SKIP_DIRS.has(entry.name)) {
                    recurse(join(current, entry.name));
                }
            } else if (entry.isFile() && entry.name.endsWith(".md")) {
                files.push(join(current, entry.name));
            }
        }
    };

    recurse(dir);
    return files;
};

const processLines = (
    lines: string[],
): { output: string[]; errors: BlockError[] } => {
    const output: string[] = [];
    const errors: BlockError[] = [];

    let i = 0;
    while (i < lines.length) {
        const opening = getAdmonishOpening(lines[i]);
        if (!opening) {
            output.push(lines[i]);
            i++;
            continue;
        }

        const { indent, fenceChar, fenceLen, optionsStr } = opening;
        const openLineNum = i + 1;

        // Collect all lines of the block including opening and closing fences.
        const blockLines: string[] = [lines[i]];
        let j = i + 1;
        let foundClosing = false;

        while (j < lines.length) {
            blockLines.push(lines[j]);
            if (isClosingFence(lines[j], fenceChar, fenceLen)) {
                foundClosing = true;
                j++;
                break;
            }
            j++;
        }

        if (!foundClosing) {
            errors.push({
                line: openLineNum,
                message: "unclosed admonish block",
            });
            for (const bl of blockLines) output.push(bl);
            i = j;
            continue;
        }

        const result = parseOptions(optionsStr);
        if (!result.ok) {
            errors.push({ line: openLineNum, message: result.error });
            for (const bl of blockLines) output.push(bl);
            i = j;
            continue;
        }

        // Convert to mdBook builtin blockquote format.
        // Content lines are between the opening and closing fences.
        const contentLines = blockLines.slice(1, -1);
        output.push(`${indent}> [!${result.mdBookType}]`);
        for (const cl of contentLines) {
            const stripped = stripIndent(cl, indent.length);
            output.push(
                stripped === "" ? `${indent}>` : `${indent}> ${stripped}`,
            );
        }

        i = j;
    }

    return { output, errors };
};

const getAdmonishOpening = (line: string): AdmonishOpening | null => {
    const info = getFenceInfo(line);
    if (!info) return null;
    if (!info.rest.startsWith("admonish")) return null;
    const afterAdmonish = info.rest.slice("admonish".length);
    // Must be end of line or a space after "admonish"
    if (afterAdmonish.length > 0 && afterAdmonish[0] !== " ") return null;
    const optionsStr = afterAdmonish.trim();
    return {
        indent: info.indent,
        fenceChar: info.fenceChar,
        fenceLen: info.fenceLen,
        optionsStr,
    };
};

const parseOptions = (optionsStr: string): ParseResult => {
    if (optionsStr === "") {
        return { ok: false, error: "no admonition type specified" };
    }

    const spaceIdx = optionsStr.indexOf(" ");
    const firstToken =
        spaceIdx === -1 ? optionsStr : optionsStr.slice(0, spaceIdx);
    const rest = spaceIdx === -1 ? "" : optionsStr.slice(spaceIdx + 1).trim();

    if (firstToken.includes("=")) {
        return {
            ok: false,
            error: `no admonition type specified (found option "${firstToken}" instead)`,
        };
    }

    if (rest !== "") {
        return {
            ok: false,
            error: `unsupported options: "${rest}" (mdBook builtin admonitions have no options)`,
        };
    }

    const type = firstToken.toLowerCase();
    const mdBookType = TYPE_MAP[type];
    if (!mdBookType) {
        return {
            ok: false,
            error: `unsupported admonition type "${type}" — mdBook builtin only supports: note, tip, hint, important, warning, attention, caution`,
        };
    }

    return { ok: true, mdBookType };
};

// A closing fence is a line that (after stripping leading whitespace) consists of
// >= fenceLen of fenceChar with only optional trailing whitespace.
const isClosingFence = (
    line: string,
    fenceChar: string,
    fenceLen: number,
): boolean => {
    const stripped = line.trimStart();
    const count = countLeadingChar(stripped, fenceChar);
    if (count < fenceLen) return false;
    return stripped.slice(count).trim() === "";
};

const getFenceInfo = (line: string): FenceInfo | null => {
    let indentLen = 0;
    while (indentLen < line.length && line[indentLen] === " ") indentLen++;
    const indent = line.slice(0, indentLen);
    const stripped = line.slice(indentLen);

    let fenceChar: string;
    if (stripped.startsWith("```")) {
        fenceChar = "`";
    } else if (stripped.startsWith("~~~")) {
        fenceChar = "~";
    } else {
        return null;
    }

    const fenceLen = countLeadingChar(stripped, fenceChar);
    const rest = stripped.slice(fenceLen);
    return { indent, fenceChar, fenceLen, rest };
};

// Strip up to n leading spaces from line.
const stripIndent = (line: string, n: number): string => {
    let i = 0;
    while (i < n && i < line.length && line[i] === " ") i++;
    return line.slice(i);
};

const countLeadingChar = (s: string, char: string): number => {
    let i = 0;
    while (i < s.length && s[i] === char) i++;
    return i;
};

main();
