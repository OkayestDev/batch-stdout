# batch-stdout

Small, dependency-less batch stdout logger.

## Features

-   **Batching**: Buffers logs up to a configurable size before writing, reducing stdout overhead.
-   **Log Levels**: Supports `debug`, `info`, `warning`, `error`, and `disabled`.
-   **Injection**: Easily inject metadata (like timestamps, trace IDs).
-   **Pretty Printing**: Optional pretty-printed log outputs.
-   **Signal Handling**: Auto-flushes logs on process exit/signals (`SIGINT`, `SIGTERM`, etc).

---

## Installation

```sh
npm install batch-stdout
```

---

## Usage

### Basic Setup

```ts
import { logger } from "batch-stdout";

const log = logger({
    batchSizeMb: 1,
});

log.info("Hello, world!");
log.error("Something went wrong.");
```

### Custom Options

```ts
const log = logger({
    batchSizeMb: 1, // maximum batch size in MB
    logLevel: "info", // "debug" | "info" | "warning" | "error" | "disabled"
    inject: () => ({
        timestamp: new Date().toISOString(),
        traceId: "abc123"
    }),
    isPrettyPrint: true, // pretty print output
    batchWindowMs: 10 // ms to flush logs if no new logs are added within timeframe
});

// You can add contextual data:
log.info("Processed user", { userId: 42, user: "alice" });
log.warning("Slow request", { ms: 5123 });
log.debug("Debug details", { meta: { ... } });
```

### Log Levels

-   `debug`, `info`, `warning`, `error`  
    Only messages at or above the set `logLevel` are logged.
-   Use `disabled` to turn off all logging.

---

## API

### `logger(options?) → Logger`

#### Options

| Name          | Type     | Default     | Description                               |
| ------------- | -------- | ----------- | ----------------------------------------- |
| batchSizeMb   | number   |             | Max batch size in MB before flush         |
| logLevel      | string   | `"debug"`   | Log level filter                          |
| inject        | function | `undefined` | Injected metadata for every log           |
| isPrettyPrint | boolean  | `false`     | Use JSON pretty printing                  |
| batchWindowMs | number   | 0           | Flush logs after timeframe. 0 is disabled |

#### Logger methods

-   `log.debug(...args)`
-   `log.info(...args)`
-   `log.warning(...args)`
-   `log.error(...args)`

Each accepts any serializable argument(s).

---

## Signal Handling

Any logs buffered in memory are automatically flushed on process termination signals  
(e.g., `SIGINT`, `SIGTERM`, `exit`, etc).

---

## Benchmark

Benchmark done using a [benchmark script](./src/__tests__/benchmark.ts), comparing `console.log` & p`rocess.stdout.write` to this library. 1000 iterations of a [log fixture](./src/__tests__/api-response.fixture.json)

```json
"batch-stdout": "35.47ms",
"batch-stdout with injection & pretty-print": "134.54ms",
"console.log": "177.16ms",
"process.stdout.write": "71.17ms",
"process.stdout.write with pretty-print": "143.16ms"
```

---

## License

MIT @OkayestDev
