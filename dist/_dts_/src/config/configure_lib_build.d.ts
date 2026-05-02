import type { ConfigEnv, UserConfig, UserConfigFnPromise } from "vite";
export declare const configure: (config: UserConfig | Promise<UserConfig> | ((env: ConfigEnv) => UserConfig | Promise<UserConfig>)) => Promise<UserConfig | UserConfigFnPromise>;
export declare const patchUserConfigWithMonodev: (_env: ConfigEnv, config: UserConfig) => UserConfig;
//# sourceMappingURL=configure_lib_build.d.ts.map