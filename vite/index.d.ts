export type MonodevViteConfig = {
    react?: boolean;
    yaml?: boolean;
    wasm?: boolean;
    worker?: "default" | "es";
};
declare function monodev(config: MonodevViteConfig): <T>(x: T) => T;

export default monodev;
