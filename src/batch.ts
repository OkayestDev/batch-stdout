function computeSize(s: string): number {
    // This isn't quite accurate compared to Buffer.byteLength
    // But the performance improvement is worth the inaccuracy
    const bytes = s.length;
    return bytes + 1; // +1 for the newline
}

export function Batch(
    batchSize: number,
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

    function add(item: any) {
        item = isPrettyPrint ? JSON.stringify(item, null, 2) : JSON.stringify(item);
        items.push(item);
        currentBatchSize += computeSize(item);
        if (batchWindowTimeout) {
            clearTimeout(batchWindowTimeout);
        }
        if (currentBatchSize >= batchSize) {
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
        return currentBatchSize;
    }

    return {
        getBatchSize,
        add,
        flush,
    };
}
