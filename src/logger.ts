import { Batch } from "./batch";
import { LogLevel } from "./constants";
import SonicBoom from "sonic-boom";

export const stream = new SonicBoom({ fd: 1, sync: false, minLength: 0 });

const logOrder: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARNING]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.DISABLED]: 4,
};

const MB_TO_BYTES = 1024 * 1024;

type Options = {
    batchSizeMb?: number;
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
        batchSizeMb = 0.25,
        inject,
        logLevel = LogLevel.DEBUG,
        isPrettyPrint = false,
        batchWindowMs = 0,
    } = options;

    function flushFn(items: any[]) {
        stream.write(items.join("\n") + "\n");
    }

    const batch = Batch(batchSizeMb * MB_TO_BYTES, flushFn, isPrettyPrint, batchWindowMs);

    const printLogLevel = (level: LogLevel) => `level:${level}`;

    function log(level: LogLevel, items: any[]) {
        if (inject) {
            return batch.add([printLogLevel(level), inject(), ...items]);
        }
        return batch.add([printLogLevel(level), ...items]);
    }

    function info(...items: any[]) {
        if (logOrder[logLevel] > logOrder.info) {
            return;
        }

        return log(LogLevel.INFO, items);
    }

    function debug(...items: any[]) {
        if (logOrder[logLevel] > logOrder.debug) {
            return;
        }

        return log(LogLevel.DEBUG, items);
    }

    function warning(...items: any[]) {
        if (logOrder[logLevel] > logOrder.warning) {
            return;
        }

        return log(LogLevel.WARNING, items);
    }

    function error(...items: any[]) {
        if (logOrder[logLevel] > logOrder.error) {
            return;
        }

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
