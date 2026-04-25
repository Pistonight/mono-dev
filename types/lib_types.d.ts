export * from "vitest/importMeta";
export * from "./yaml.d.ts";

export interface ImportMeta {
    url: string;
    readonly version: string;
}
