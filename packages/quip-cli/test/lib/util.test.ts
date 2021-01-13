import path from "path";
import { readRecursive } from "../../src/lib/util";
describe("readRecursive", () => {
    test("basics", async () => {
        const files = await readRecursive(
            path.join(__dirname, "..", "fixtures", "readdir"),
            ""
        );
        expect(files).toMatchSnapshot();
    });
    test("skips", async () => {
        const files = await readRecursive(
            path.join(__dirname, "..", "fixtures", "readdir"),
            "test-subdir"
        );
        expect(files).toMatchSnapshot();
    });
});
