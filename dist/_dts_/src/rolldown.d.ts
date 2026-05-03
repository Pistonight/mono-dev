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
export declare const wrapChunkFileNames: (original: string | ((chunk: PreRenderedChunk) => string) | undefined, fn: (chunk: PreRenderedChunk) => string | undefined) => ((chunk: PreRenderedChunk) => string);
export declare const wrapEntryFileNames: (original: string | ((chunk: PreRenderedChunk) => string) | undefined, fn: (chunk: PreRenderedChunk) => string | undefined) => ((chunk: PreRenderedChunk) => string);
export declare const wrapAssetFileNames: (original: string | ((chunk: PreRenderedAsset) => string) | undefined, fn: (chunk: PreRenderedAsset) => string | undefined) => ((chunk: PreRenderedAsset) => string);
//# sourceMappingURL=rolldown.d.ts.map