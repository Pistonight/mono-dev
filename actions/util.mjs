import fs from "node:fs";

const EOF_DELIMITER = "#[#EOF#]#❌";

export const writeGitHubOutput = (outputs) => {
    const file = process.env.GITHUB_OUTPUT;
    if (!file) {
        throw new Error("GITHUB_OUTPUT is not set");
    }

    const lines = [];

    for (const key in outputs) {
        const value = `${outputs[key]}`;
        if (value.includes("\n") || value.includes("\r")) {
            lines.push(`${key}<<${EOF_DELIMITER}`);
            lines.push(value);
            lines.push(EOF_DELIMITER);
        } else {
            lines.push(`${key}=${value}`);
        }
    }
    console.log("Output:");
    const outputString = lines.join("\n");
    console.log(outputString);
    fs.appendFileSync(file, outputString + "\n", "utf8");
};
