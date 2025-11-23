import { LogLevel } from "../constants";
import { logger } from "../logger";

describe("Logger", () => {
    it("log with defaults", () => {
        const stdoutSpy = jest.spyOn(process.stdout, "write");
        const log = logger();

        log.info("Hello, world!");
        log.flush();
        expect(stdoutSpy).toHaveBeenCalledWith(JSON.stringify([LogLevel.INFO, "Hello, world!"]));
    });

    it("should debug", async () => {
        const stdoutSpy = jest.spyOn(process.stdout, "write");
        const log = logger({
            batchSizeMb: 1 / (1024 * 1024), // 1 byte
            inject: () => ({ timestamp: "now", trace: "1234" }),
        });
        log.debug("Hello, world!");
        expect(stdoutSpy).toHaveBeenCalledWith(
            JSON.stringify([LogLevel.DEBUG, { timestamp: "now", trace: "1234" }, "Hello, world!"])
        );
    });

    it("should inject whatever is returned from provided inject function", () => {
        const inject = jest.fn(() => ({ timestamp: new Date().toISOString() }));
        const log = logger({ batchSizeMb: 1024, inject });

        log.info("Hello, world!");
        expect(inject).toHaveBeenCalledWith();
    });

    it("should write to stdout on flush", () => {
        const stdoutSpy = jest.spyOn(process.stdout, "write");
        const log = logger({ batchSizeMb: 20 / (1024 * 1024) });
        log.info("Hello, world!");
        log.info("Hello, world!");
        expect(stdoutSpy).toHaveBeenCalled();
    });

    describe("handle signals", () => {
        it("should handle SIGINT", async () => {
            const stdoutSpy = jest.spyOn(process.stdout, "write");
            const log = logger({ batchSizeMb: 1024 });
            log.info("Hello, world!");
            await process.emit("SIGINT");
            expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Hello, world!"));
        });
    });

    describe("log levels", () => {
        it("should only log errors on log level error", () => {
            const inject = jest.fn();
            const log = logger({ batchSizeMb: 1024, inject, logLevel: "error" });

            log.debug("Hello, world!");
            expect(inject).not.toHaveBeenCalled();

            log.error("Error!");
            expect(inject).toHaveBeenCalledWith();
        });

        it("should only warn at appropriate log level", () => {
            const inject = jest.fn();
            const log = logger({ batchSizeMb: 1024, inject, logLevel: "warning" });

            log.debug("Hello, world!");
            expect(inject).not.toHaveBeenCalled();

            log.warning("Warning!");
            expect(inject).toHaveBeenCalledWith();
        });

        it("shouldn't debug", () => {
            const inject = jest.fn();
            const log = logger({ batchSizeMb: 1024, inject, logLevel: "error" });
            log.debug("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });

        it("shouldn't info", () => {
            const inject = jest.fn();
            const log = logger({ batchSizeMb: 1024, inject, logLevel: "error" });
            log.info("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });

        it("shouldn't warn", () => {
            const inject = jest.fn();
            const log = logger({ batchSizeMb: 1024, inject, logLevel: "error" });
            log.warning("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });

        it("shouldn't error if disabled", () => {
            const inject = jest.fn();
            const log = logger({ batchSizeMb: 1024, inject, logLevel: "disabled" });
            log.error("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });
    });
});
