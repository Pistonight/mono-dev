import type { Linter } from "eslint";
export declare const configure: () => EslintConfigPart[] | EslintConfigPart;
export type EslintOverrides = Record<string, Linter.RulesRecord[string] | EslintOverrideFn>;
export type EslintOverrideFn = (existing: Linter.RulesRecord[string]) => Linter.RulesRecord[string];
export declare const overrideEslintConfig: <T extends keyof EslintConfigPartSelector>(configs: EslintConfigPartSelector[T], overrides: EslintOverrides) => EslintConfigPartSelector[T];
export interface EslintConfigPart {
    rules?: Partial<Linter.RulesRecord> | undefined;
}
export interface EslintConfigPartSelector {
    single: EslintConfigPart;
    array: EslintConfigPart[];
}
