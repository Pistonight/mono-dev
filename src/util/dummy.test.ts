import { test, expect } from "mono-dev/vitest";
import DATA from "./dummy.yaml";

test("just making sure test works", () => {
    expect(DATA).toEqual({
        "justmakingsure": ["this can import"]
    });
});
