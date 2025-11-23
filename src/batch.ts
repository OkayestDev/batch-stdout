import { BatchLimitType } from "./constants";

function computeSize(s: string): number {
    // This isn't quite accurate compared to Buffer.byteLength
    // But the performance improvement is worth the inaccuracy
    const bytes = s.length;
    return bytes + 1; // +1 for the newline
}

const MB_TO_BYTES = 1024 * 1024;

export function Batch(
    batchLimitType: BatchLimitType,
    batchLimit: number,
    flushCallback: (items: any[]) => void,
    isPrettyPrint: boolean = false,
    batchWindowMs: number = 0
) {
    let items: any[] = [];
    let currentBatchSize = 0;
    let batchWindowTimeout: NodeJS.Timeout | undefined = undefined;

    function setBatchWindowTimeout() {
        if (batchWindowMs) {
            batchWindowTimeout = setTimeout(flush, batchWindowMs);
        }
    }

    function shouldFlush(item: string) {
        switch (batchLimitType) {
            case BatchLimitType.COUNT:
                return items.length >= batchLimit;
            case BatchLimitType.SIZE:
                currentBatchSize += computeSize(item);
                return currentBatchSize >= batchLimit * MB_TO_BYTES;
        }
    }

    function add(item: any) {
        item = isPrettyPrint ? JSON.stringify(item, null, 2) : JSON.stringify(item);
        items.push(item);
        if (batchWindowTimeout) {
            clearTimeout(batchWindowTimeout);
        }
        if (shouldFlush(item)) {
            return flush();
        }
        setBatchWindowTimeout();
    }

    function flush() {
        flushCallback(items);
        items = [];
        currentBatchSize = 0;
    }

    function getBatchSize() {
        switch (batchLimitType) {
            case BatchLimitType.COUNT:
                return items.length;
            case BatchLimitType.SIZE:
                return currentBatchSize;
        }
    }

    return {
        getBatchSize,
        add,
        flush,
    };
}
