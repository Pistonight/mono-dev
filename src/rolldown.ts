import type {
    PreRenderedAsset as RolldownPreRenderedAsset,
    PreRenderedChunk as RolldownPreRenderedChunk,
} from "rolldown";

// let downstream configure without adding rolldown as dependency
export interface PreRenderedChunk {
    /** The name of this chunk, which is used in naming patterns. */
    name: string;
    /** Whether this chunk is a static entry point. */
    isEntry: boolean;
    /** Whether this chunk is a dynamic entry point. */
    isDynamicEntry: boolean;
    /** The id of a module that this chunk corresponds to. */
    facadeModuleId?: string;
    /** The list of ids of modules included in this chunk. */
    moduleIds: Array<string>;
    /** Exported variable names from this chunk. */
    exports: Array<string>;
}

// let downstream configure without adding rolldown as dependency
export interface PreRenderedAsset {
    type: "asset";
    /** @deprecated Use {@linkcode names} instead. */
    name?: string;
    names: string[];
    /** @deprecated Use {@linkcode originalFileNames} instead. */
    originalFileName?: string;
    /** The list of the absolute paths to the original file of this asset. */
    originalFileNames: string[];
    /** The content of this asset. */
    source: AssetSource;
}

export type AssetSource = string | Uint8Array;

if (import.meta.vitest) {
    const { test, expectTypeOf } = import.meta.vitest;
    test("rolldown types are same", () => {
        expectTypeOf<PreRenderedChunk>().toEqualTypeOf<RolldownPreRenderedChunk>();
        expectTypeOf<PreRenderedAsset>().toEqualTypeOf<RolldownPreRenderedAsset>();
    });
}

export const wrapChunkFileNames = (
    original: string | ((chunk: PreRenderedChunk) => string) | undefined,
    fn: (chunk: PreRenderedChunk) => string | undefined,
): ((chunk: PreRenderedChunk) => string) => {
    return (chunk) => {
        const got = fn(chunk);
        if (got) {
            return got;
        }
        if (!original) {
            return "[name]-[hash].js";
        }
        if (typeof original === "string") {
            return original;
        }
        return original(chunk);
    };
};
export const wrapEntryFileNames = (
    original: string | ((chunk: PreRenderedChunk) => string) | undefined,
    fn: (chunk: PreRenderedChunk) => string | undefined,
): ((chunk: PreRenderedChunk) => string) => {
    return (chunk) => {
        const got = fn(chunk);
        if (got) {
            return got;
        }
        if (!original) {
            return "[name].js";
        }
        if (typeof original === "string") {
            return original;
        }
        return original(chunk);
    };
};
export const wrapAssetFileNames = (
    original: string | ((chunk: PreRenderedAsset) => string) | undefined,
    fn: (chunk: PreRenderedAsset) => string | undefined,
): ((chunk: PreRenderedAsset) => string) => {
    return (chunk) => {
        const got = fn(chunk);
        if (got) {
            return got;
        }
        if (!original) {
            return "assets/[name]-[hash][extname]";
        }
        if (typeof original === "string") {
            return original;
        }
        return original(chunk);
    };
};
