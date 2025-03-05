declare type Config = {
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
};

declare function config(opts: Config): any;
declare function override(opts: Config, override: any): any;
