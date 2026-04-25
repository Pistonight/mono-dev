import { type Void } from "./result.ts";
export declare const executeShim: (bin: string) => never;
/** execute binary from node_modules */
export declare const executeNode: (bin: string, cwd: string, args: string[]) => Void<string>;
/** execute native binary on the system */
export declare const executeNative: (bin: string, cwd: string, args: string[]) => Promise<Void<string>>;
export declare const executeNativeRaw: (bin: string, cwd: string, args: string[]) => Promise<Void<string>>;
//# sourceMappingURL=execute.d.ts.map