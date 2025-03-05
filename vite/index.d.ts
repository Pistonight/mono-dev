export type MonodevViteConfig = {
    /**
     * Look for .cert/cert.key and .cert/cert.pem 2 levels
     * up from the current directory (including the current directory),
     * and use them to configure HTTPS for the dev server.
     */
    https?: boolean;

    /** Load the WASM plugin */
    wasm?: boolean;

    /**
     * Worker format
     *
     * - unspecified: no plugin config will be set for worker
     * - "default": set the same plugins for worker, and don't set the format
     * - other: set the same plugins for worker, and set the format to the value
     */
    worker?: "default" | "es";
};
declare function monodev(config: MonodevViteConfig): <T>(x: T) => T;

export default monodev;
