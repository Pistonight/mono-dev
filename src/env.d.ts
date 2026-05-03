/// <reference types="node" />
/// <reference types="vite/client" />
/// <reference types="vitest/importMeta" />
/// <reference types="vitest/config" />

// SPDX-License-Identifier: MIT
// Copyright (c) 2026 @modyfi/vite-plugin-yaml
declare module "*.yaml" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value: Record<string, any>;
    export default value;
}

declare module "typedoc-theme-oxide" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function load(): any;
}
