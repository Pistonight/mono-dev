import type { ConfigEnv, UserConfig, UserConfigFnPromise } from "vite";
export declare const configure: (config: UserConfig | Promise<UserConfig> | ((env: ConfigEnv) => UserConfig | Promise<UserConfig>)) => Promise<UserConfig | UserConfigFnPromise>;
