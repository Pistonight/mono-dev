export type Config = {
    /** path to ignore  */
    ignores: string[];
    /** root dir of tsconfig, likely `import.meta.dirname` */
    tsconfigRootDir: string;
    /**
     * set to false to disable react rules (true by default)
     *
     * some rules may cause conflict in server frameworks
     */
    react?: boolean;
    /** If true, additional rules are applied for writing library */
    isLib?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function config(opts: Config): any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function override(opts: Config, override: any): any;
