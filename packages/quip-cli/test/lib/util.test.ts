import path from "path";
import { readRecursive } from "../../src/lib/util";
describe("readRecursive", () => {
    test("basics", async () => {
        const files = await readRecursive(
            path.join(__dirname, "../fixtures/readdir"),
            ""
        );
        expect(files).toMatchInlineSnapshot(`
            Array [
              "test-dir/test-subdir/sub-sub-1",
              "test-dir/test-subdir/sub-sub-2",
              "test-dir/test-subfile",
              "test-file",
            ]
        `);
    });
    test("skips", async () => {
        const files = await readRecursive(
            path.join(__dirname, "../fixtures/readdir"),
            "test-subdir"
        );
        expect(files).toMatchInlineSnapshot(`
            Array [
              "test-dir/test-subfile",
              "test-file",
            ]
        `);
    });
});
