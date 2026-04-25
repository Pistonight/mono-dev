import type { Linter } from "eslint";
export declare const configure: () => EslintConfigPart[] | EslintConfigPart;
export declare const overrideEslintConfig: <T extends keyof EslintConfigPartSelector>(configs: EslintConfigPartSelector[T], overrides: Linter.RulesRecord) => EslintConfigPartSelector[T];
export interface EslintConfigPart {
    rules?: Partial<Linter.RulesRecord> | undefined;
}
export interface EslintConfigPartSelector {
    single: EslintConfigPart;
    array: EslintConfigPart[];
}
//# sourceMappingURL=configure_eslint.d.ts.map