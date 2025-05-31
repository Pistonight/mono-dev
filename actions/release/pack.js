const {
    MONODEV_RELEASE_FILES,
    MONODEV_RELEASE_PACK,
    MONODEV_RELEASE_HAS_MINISIGN_KEY,
    MONODEV_RELEASE_ARTIFACTS_PATH,
    MONODEV_RELEASE_APPEND_VERSION,
    MONODEV_RELEASE_VERSION,
} = process.env;

const fs = require('node:fs');
const path = require('node:path');
const childProcess = require("node:child_process");

const shouldUseZip = (name) => {
    return name.toLowerCase().includes("pc-windows-msvc")
};

const appendVersion = `${MONODEV_RELEASE_APPEND_VERSION}`.toLowerCase() === "true";
const shouldPack = `${MONODEV_RELEASE_PACK}`.toLowerCase() === "true";
const hasMinisignKey = `${MONODEV_RELEASE_HAS_MINISIGN_KEY}`.toLowerCase() === "true";

const outputFiles = (MONODEV_RELEASE_FILES || "").split(" ").filter(file => file.trim()); 

if (shouldPack) {
    const BIN = "7z";
    const packDir = (dir_name) => {
        console.log(`Packing ${dir_name}...`);
        const useZip = shouldUseZip(dir_name);

        let outputFile;
        if (useZip) {
            if (appendVersion) {
                outputFile = `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}-${MONODEV_RELEASE_VERSION}.zip`;
            } else {
                outputFile = `${MONODEV_RELEASE_ARTIFACTS_PATH}/${dir_name}.zip`;
            }
            const child = childProcess.spawnSync(
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
            let child = childProcess.spawnSync(
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
            child = childProcess.spawnSync(
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
        outputFiles.push(outputFile);
    }
}

const signatureFiles = hasMinisignKey ? outputFiles.map(file => `${file}.sig`) : [];

fs.appendFileSync(process.env.GITHUB_OUTPUT, `packed_files=${outputFiles.join(" ")}\nsignature_files=${signatureFiles.join(" ")}\n`, "utf8");
