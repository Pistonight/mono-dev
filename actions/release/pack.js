import fs from "node:fs";
import path from "node:path";
import child_process from "node:child_process";

const {
    MONODEV_RELEASE_FILES,
    MONODEV_RELEASE_PACK,
    MONODEV_RELEASE_HAS_MINISIGN_KEY,
    MONODEV_RELEASE_ARTIFACTS_PATH,
    MONODEV_RELEASE_APPEND_VERSION,
    MONODEV_RELEASE_VERSION,
} = process.env;

const shouldUseZip = (name) => {
    return name.toLowerCase().includes("pc-windows-msvc")
};

const packPattern = MONODEV_RELEASE_PACK.trim();
console.log(`Pack pattern: ${packPattern}`);
let packPatternMatcher;
if (packPattern === "true" || packPattern === "**") {
    packPatternMatcher = () => true;
} else if (packPattern === "false") {
    packPatternMatcher = () => false;
} else if (packPattern.startsWith("*")) {
    const suffix = packPattern.substring(1);
    if (suffix.endsWith("*")) {
        const middle = suffix.substring(0, suffix.length - 1);
        packPatternMatcher = (dir_name) => dir_name.includes(middle);
    } else {
        packPatternMatcher = (dir_name) => dir_name.endsWith(suffix);
    }
} else if (packPattern.endsWith("*")) {
    const prefix = packPattern.substring(0, packPattern.length - 1);
    packPatternMatcher = (dir_name) => dir_name.startsWith(prefix);
} else {
    packPatternMatcher = (dir_name) => dir_name === packPattern;
}

const appendVersion = `${MONODEV_RELEASE_APPEND_VERSION}`.toLowerCase() === "true";
const hasMinisignKey = `${MONODEV_RELEASE_HAS_MINISIGN_KEY}`.toLowerCase() === "true";
const outputFiles = (MONODEV_RELEASE_FILES || "").split(" ").filter(file => file.trim()); 

const BIN = "7z";
const packDir = (dir_name) => {
    if (!packPatternMatcher(dir_name)) {
        console.log(`${dir_name} filtered out by the pack pattern`);
        return undefined;
    }
    console.log(`Packing ${dir_name}...`);
    const useZip = shouldUseZip(dir_name);

    let outputFile;
    if (useZip) {
        if (appendVersion) {
            outputFile = `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}-${MONODEV_RELEASE_VERSION}.zip`;
        } else {
            outputFile = `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}.zip`;
        }
        const child = child_process.spawnSync(
            BIN, 
            [
                "a", "-tzip", 
                outputFile,
                `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}/*`
            ],
            { stdio: "inherit" }
        );
        if (child.error || child.status !== 0) {
            console.error(`Error packing ${dir_name} with zip:`, child.error || `Exited with code ${child.status}`);
            throw new Error(`Failed to pack ${dir_name} with zip`);
        }
    } else {
        if (appendVersion) {
            outputFile = `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}-${MONODEV_RELEASE_VERSION}.tar.gz`;
        } else {
            outputFile = `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}.tar.gz`;
        }
        const intermediateTar = `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}.tar`;
        let child = child_process.spawnSync(
            BIN, 
            [
                "a", "-ttar", 
                intermediateTar,
                `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}/*`
            ],
            { stdio: "inherit" }
        );
        if (child.error || child.status !== 0) {
            console.error(`Error packing ${dir_name} with tar:`, child.error || `Exited with code ${child.status}`);
            throw new Error(`Failed to pack ${dir_name} with tar`);
        }
        child = child_process.spawnSync(
            BIN, 
            [ "a", "-tgzip", outputFile, intermediateTar ],
            { stdio: "inherit" }
        );
        if (child.error || child.status !== 0) {
            console.error(`Error packing ${dir_name} with gzip:`, child.error || `Exited with code ${child.status}`);
            throw new Error(`Failed to pack ${dir_name} with gzip`);
        }
        fs.unlinkSync(intermediateTar);
    }
    console.log(`Output file: ${outputFile}`);
    return outputFile;
}
const files = fs.readdirSync(MONODEV_RELEASE_ARTIFACTS_PATH);
for (const file of files) {
    // check if the file is a directory
    const filePath = path.join(MONODEV_RELEASE_ARTIFACTS_PATH, file);
    if (!fs.statSync(filePath).isDirectory()) {
        continue;
    }
    const outputFile = packDir(MONODEV_RELEASE_ARTIFACTS_PATH, file);
    if (!outputFile) {
        continue;
    }
    outputFiles.push(outputFile);
}

const signatureFiles = hasMinisignKey ? outputFiles.map(file => `${file}.sig`) : [];

fs.appendFileSync(process.env.GITHUB_OUTPUT, `packed_files=${outputFiles.join(" ")}\nsignature_files=${signatureFiles.join(" ")}\n`, "utf8");
