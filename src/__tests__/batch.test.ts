import { Batch } from "../batch";
import { BatchLimitType } from "../constants";

jest.useFakeTimers();

describe("Batch", () => {
    it("should invoke flush callback after batch window", () => {
        const flushCallback = jest.fn();
        const batch = Batch(BatchLimitType.SIZE, 1024, flushCallback, false, 100);
        batch.add({ name: "John" });
        expect(flushCallback).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(flushCallback).toHaveBeenCalledWith([JSON.stringify({ name: "John" })]);
    });

    it("should flush on batch count limit", () => {
        const flushCallback = jest.fn();
        const batch = Batch(BatchLimitType.COUNT, 2, flushCallback, false, 100);
        batch.add({ name: "John" });
        batch.add({ name: "Jane" });
        expect(flushCallback).toHaveBeenCalledWith([
            JSON.stringify({ name: "John" }),
            JSON.stringify({ name: "Jane" }),
        ]);
        batch.add({ name: "Jim" });
        expect(flushCallback).toHaveBeenCalledTimes(1);
        expect(batch.getBatchSize()).toBe(1);
    });

    it("should clear timeout when adding", () => {
        const flushCallback = jest.fn();
        const batch = Batch(BatchLimitType.SIZE, 1024, flushCallback, false, 100);
        batch.add({ name: "John" });
        jest.advanceTimersByTime(25);
        batch.add({ name: "Jane" });
        jest.advanceTimersByTime(75);
        expect(flushCallback).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(flushCallback).toHaveBeenCalledWith([
            JSON.stringify({ name: "John" }),
            JSON.stringify({ name: "Jane" }),
        ]);
    });

    it("should count current batch size", () => {
        const flushCallback = jest.fn();
        const batch = Batch(BatchLimitType.SIZE, 1024, flushCallback, false, 100);
        batch.add({ name: "John" });
        expect(flushCallback).not.toHaveBeenCalled();
        expect(batch.getBatchSize()).toBe(16);
    });

    it("should pretty print items", () => {
        const flushCallback = jest.fn();
        const batch = Batch(BatchLimitType.SIZE, 1024, flushCallback, true, 100);
        batch.add({ name: "John" });
        batch.flush();
        expect(flushCallback).toHaveBeenCalledWith([JSON.stringify({ name: "John" }, null, 2)]);
        expect(batch.getBatchSize()).toBe(0);
    });

    it("should invoke flush callback on flush", () => {
        const flushCallback = jest.fn();
        const batch = Batch(BatchLimitType.SIZE, 1024, flushCallback, false, 100);
        batch.add({ name: "John" });
        batch.add({ name: "Jane" });
        batch.flush();
        expect(flushCallback).toHaveBeenCalledWith([
            JSON.stringify({ name: "John" }),
            JSON.stringify({ name: "Jane" }),
        ]);
        expect(batch.getBatchSize()).toBe(0);
    });

    it("should auto-flush", () => {
        const flushCallback = jest.fn();
        // 1 byte size
        const batch = Batch(BatchLimitType.SIZE, 1 / (1024 * 1024), flushCallback, false, 100);
        batch.add({ name: "John" });
        expect(flushCallback).toHaveBeenCalledWith([JSON.stringify({ name: "John" })]);
        expect(batch.getBatchSize()).toBe(0);
    });

    it("works with log level and injection", () => {
        const flushCallback = jest.fn();
        const batch = Batch(BatchLimitType.SIZE, 1024, flushCallback, false, 100);
        const payload = ["info", { timestamp: new Date().toISOString() }, "Hello, world!"];
        batch.add(payload);
        batch.flush();
        expect(flushCallback).toHaveBeenCalledWith([JSON.stringify(payload)]);
        expect(batch.getBatchSize()).toBe(0);
    });
});
