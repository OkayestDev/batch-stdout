import { Batch } from "./batch";
import { BatchLimitType, LogLevel } from "./constants";
import SonicBoom from "sonic-boom";
import { isObject } from "./utils/object.utils";

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

export function buildLog(level: LogLevel, items: any[], inject?: () => any) {
    const injection = inject ? inject() : undefined;
    const log: Record<string, any> = {
        level,
        msg: undefined,
    };
    const msgParts: string[] = [];

    if (isObject(injection)) {
        Object.assign(log, injection);
    }

    for (const item of items) {
        if (!item) {
            continue;
        }

        if (isObject(item)) {
            Object.assign(log, item);
            continue;
        }

        msgParts.push(typeof item === "string" ? item : JSON.stringify(items));
    }

    if (msgParts.length > 0) {
        log.msg = msgParts.join(" ");
    }

    return log;
}

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

    function log(level: LogLevel, items: any[]) {
        if (logOrder[logLevel] > logOrder[level]) {
            return;
        }

        const log = buildLog(level, items, inject);
        batch.add(log);
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
