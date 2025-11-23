import { LogLevel } from "../constants";
import { logger, stream, buildLog } from "../logger";

describe("Logger", () => {
    it("log with defaults", () => {
        const stdoutSpy = jest.spyOn(stream, "write");
        const log = logger();
        log.info("Hello, world!");
        log.flush();
        expect(stdoutSpy).toHaveBeenCalledWith(
            JSON.stringify({ level: "info", msg: "Hello, world!" }) + "\n"
        );
    });

    it("should debug", async () => {
        const stdoutSpy = jest.spyOn(stream, "write");
        const log = logger({
            batchLimit: 1 / (1024 * 1024), // 1 byte
            inject: () => ({ timestamp: "now", trace: "1234" }),
        });
        log.debug("Hello, world!");
        expect(stdoutSpy).toHaveBeenCalledWith(
            JSON.stringify({
                level: "debug",
                msg: "Hello, world!",
                timestamp: "now",
                trace: "1234",
            }) + "\n"
        );
    });

    it("should inject whatever is returned from provided inject function", () => {
        const inject = jest.fn(() => ({ timestamp: new Date().toISOString() }));
        const log = logger({ batchLimit: 1024, inject });

        log.info("Hello, world!");
        expect(inject).toHaveBeenCalledWith();
    });

    it("should write to stdout on flush", () => {
        const stdoutSpy = jest.spyOn(stream, "write");
        const log = logger({ batchLimit: 20 / (1024 * 1024) });
        log.info("Hello, world!");
        log.info("Hello, world!");
        expect(stdoutSpy).toHaveBeenCalled();
    });

    describe("log levels", () => {
        it("should only log errors on log level error", () => {
            const inject = jest.fn();
            const log = logger({ batchLimit: 1024, inject, logLevel: "error" });

            log.debug("Hello, world!");
            expect(inject).not.toHaveBeenCalled();

            log.error("Error!");
            expect(inject).toHaveBeenCalledWith();
        });

        it("should only warn at appropriate log level", () => {
            const inject = jest.fn();
            const log = logger({ batchLimit: 1024, inject, logLevel: "warning" });

            log.debug("Hello, world!");
            expect(inject).not.toHaveBeenCalled();

            log.warning("Warning!");
            expect(inject).toHaveBeenCalledWith();
        });

        it("shouldn't debug", () => {
            const inject = jest.fn();
            const log = logger({ batchLimit: 1024, inject, logLevel: "error" });
            log.debug("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });

        it("shouldn't info", () => {
            const inject = jest.fn();
            const log = logger({ batchLimit: 1024, inject, logLevel: "error" });
            log.info("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });

        it("shouldn't warn", () => {
            const inject = jest.fn();
            const log = logger({ batchLimit: 1024, inject, logLevel: "error" });
            log.warning("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });

        it("shouldn't error if disabled", () => {
            const inject = jest.fn();
            const log = logger({ batchLimit: 1024, inject, logLevel: "disabled" });
            log.error("Hello, world!");
            expect(inject).not.toHaveBeenCalled();
        });
    });

    describe("buildLog", () => {
        it("should build a log object", () => {
            const log = buildLog(LogLevel.INFO, ["Hello, world!"], () => ({
                timestamp: "123",
            }));
            expect(log).toEqual({ level: "info", msg: "Hello, world!", timestamp: "123" });
        });

        it("should merge objects", () => {
            const log = buildLog(
                LogLevel.INFO,
                [
                    {
                        id: "123",
                        name: "John",
                        lastName: "Doe",
                        birthday: "1990-01-01",
                    },
                ],
                () => ({
                    timestamp: "123",
                })
            );
            expect(log).toEqual({
                level: "info",
                id: "123",
                name: "John",
                lastName: "Doe",
                birthday: "1990-01-01",
                timestamp: "123",
            });
        });
    });
});
