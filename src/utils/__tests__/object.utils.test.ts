import { isObject } from "../object.utils";

describe("object.utils", () => {
    describe("isObject", () => {
        it("should return true if the value is an object", () => {
            expect(isObject({})).toBe(true);
        });

        it("should return false if the value is not an object", () => {
            expect(isObject(1)).toBe(false);
            expect(isObject("string")).toBe(false);
            expect(isObject(true)).toBe(false);
            expect(isObject(false)).toBe(false);
            expect(isObject(null)).toBe(false);
            expect(isObject(undefined)).toBe(false);
        });
    });
});
