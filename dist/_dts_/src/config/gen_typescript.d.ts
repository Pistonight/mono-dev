import { type PackageJson } from "#util";
export declare const genTypeScriptConfig: (packageJson: PackageJson) => Promise<{
    projectCount: number;
    nonTsDirectories: string[];
}>;
