export * from "vitest/importMeta";
export * from "./yaml.d.ts";

interface ImportMeta {
  url: string,
  readonly version: string,
}
