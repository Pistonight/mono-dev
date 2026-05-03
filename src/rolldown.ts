import type {
    OutputOptions as RolldownOutputOptions,
    PreRenderedAsset as RolldownPreRenderedAsset,
    PreRenderedChunk as RolldownPreRenderedChunk,
} from "rolldown";

export type { RolldownOutputOptions, RolldownPreRenderedChunk, RolldownPreRenderedAsset };

export const wrapChunkFileNames = (
    isLib: boolean,
    original: string | ((chunk: RolldownPreRenderedChunk) => string) | undefined,
    fn: (chunk: RolldownPreRenderedChunk) => string | undefined,
): ((chunk: RolldownPreRenderedChunk) => string) => {
    return (chunk) => {
        const got = fn(chunk);
        if (got) {
            return got;
        }
        if (!original) {
            return isLib ? "[name]-[hash].js" : "assets/[name]-[hash].js";
        }
        if (typeof original === "string") {
            return original;
        }
        return original(chunk);
    };
};
export const wrapEntryFileNames = (
    isLib: boolean,
    original: string | ((chunk: RolldownPreRenderedChunk) => string) | undefined,
    fn: (chunk: RolldownPreRenderedChunk) => string | undefined,
): ((chunk: RolldownPreRenderedChunk) => string) => {
    return (chunk) => {
        const got = fn(chunk);
        if (got) {
            return got;
        }
        if (!original) {
            return isLib ? "[name].js" : "assets/[name]-[hash].js";
        }
        if (typeof original === "string") {
            return original;
        }
        return original(chunk);
    };
};
export const wrapAssetFileNames = (
    original: string | ((chunk: RolldownPreRenderedAsset) => string) | undefined,
    fn: (chunk: RolldownPreRenderedAsset) => string | undefined,
): ((chunk: RolldownPreRenderedAsset) => string) => {
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
