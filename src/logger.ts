import { Batch } from "./batch";
import { BatchLimitType, LogLevel } from "./constants";
import SonicBoom from "sonic-boom";

export const stream = new SonicBoom({ fd: 1, sync: false, minLength: 0 });

const logOrder: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARNING]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.DISABLED]: 4,
};

export type Options = {
    batchLimitType?: "count" | "size";
    batchLimit?: number;
    logLevel?: "info" | "debug" | "warning" | "error" | "disabled";
    inject?: () => any;
    /**
     * Pretty print the output
     * @Note this is a performance hit
     * */
    isPrettyPrint?: boolean;
    batchWindowMs?: number;
};

export function logger(options: Options = {}) {
    const {
        batchLimitType = BatchLimitType.SIZE,
        batchLimit = 0.25,
        inject,
        logLevel = LogLevel.DEBUG,
        isPrettyPrint = false,
        batchWindowMs = 0,
    } = options;

    function flushFn(items: any[]) {
        stream.write(items.join("\n") + "\n");
    }

    const batch = Batch(
        batchLimitType as BatchLimitType,
        batchLimit,
        flushFn,
        isPrettyPrint,
        batchWindowMs
    );

    const printLogLevel = (level: LogLevel) => `level:${level}`;

    function log(level: LogLevel, items: any[]) {
        if (logOrder[logLevel] > logOrder[level]) {
            return;
        }

        if (inject) {
            return batch.add([printLogLevel(level), inject(), ...items]);
        }
        return batch.add([printLogLevel(level), ...items]);
    }

    function info(...items: any[]) {
        return log(LogLevel.INFO, items);
    }

    function debug(...items: any[]) {
        return log(LogLevel.DEBUG, items);
    }

    function warning(...items: any[]) {
        return log(LogLevel.WARNING, items);
    }

    function error(...items: any[]) {
        return log(LogLevel.ERROR, items);
    }

    /** Flush all logs in memory */
    function flush() {
        batch.flush();
        stream.flush();
    }

    return {
        info,
        debug,
        error,
        warning,
        flush,
    };
}
