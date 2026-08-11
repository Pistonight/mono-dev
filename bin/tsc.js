import { executeShim } from "../dist/cli/index.js";
executeShim("tsgo"); // mono-dev still uses ts-preview since tsc6 is needed for typedoc
