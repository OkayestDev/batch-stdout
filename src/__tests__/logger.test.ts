import { logger } from "../logger";

describe("Logger", () => {
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
    });
});
