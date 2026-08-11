import { type Result, type PackageJson, type LibExportConfig } from "#util";
export declare const parseExports: (root: string, packageJson: PackageJson, print?: boolean) => Result<LibExportConfig, string>;
