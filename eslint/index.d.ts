declare type Config = {
    // path/* to ignore directory
    ignores: string[];
    // root dir of tsconfig, likely `import.meta.dirname`
    tsconfigRootDir: string;
};

declare function config(opts: Config): any;
declare function override(opts: Config, override: any): any;
