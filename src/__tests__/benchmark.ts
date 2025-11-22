import { logger } from "../logger";
import apiResponseFixture from "./api-response.fixture.json";

const ITERATIONS = 1000;

function thisBenchmark() {
    const log = logger({
        batchSizeMb: 100,
        isPrettyPrint: false,
    });
    const logStart = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        log.info(apiResponseFixture);
    }
    const logEnd = performance.now();
    const logDuration = logEnd - logStart;
    console.log(`Logged ${ITERATIONS} messages in ${logDuration}ms`);
    return logDuration;
}

function thisPrettyPrintAndInjectBenchmark() {
    const log = logger({
        batchSizeMb: 100,
        isPrettyPrint: true,
        inject: () => ({ timestamp: new Date().toISOString() }),
    });
    const logStart = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        log.info(apiResponseFixture);
    }
    const logEnd = performance.now();
    const logDuration = logEnd - logStart;
    console.log(`Logged ${ITERATIONS} messages in ${logDuration}ms`);
    return logDuration;
}

function consoleBenchmark() {
    const consoleStart = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        console.log(apiResponseFixture);
    }
    const consoleEnd = performance.now();
    const consoleDuration = consoleEnd - consoleStart;
    console.log(`Logged ${ITERATIONS} messages in ${consoleDuration}ms`);
    return consoleDuration;
}

function stdoutBenchmark() {
    const stdoutStart = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        process.stdout.write(JSON.stringify(apiResponseFixture) + "\n");
    }
    const stdoutEnd = performance.now();
    const stdoutDuration = stdoutEnd - stdoutStart;
    console.log(`Logged ${ITERATIONS} messages in ${stdoutDuration}ms`);
    return stdoutDuration;
}

function formatDuration(duration: number) {
    return duration.toFixed(2) + "ms";
}

require("fs").writeFileSync(
    "benchmark.json",
    JSON.stringify(
        {
            thisDuration: formatDuration(thisBenchmark()),
            thisPrettyPrintAndInjectDuration: formatDuration(thisPrettyPrintAndInjectBenchmark()),
            consoleDuration: formatDuration(consoleBenchmark()),
            stdoutDuration: formatDuration(stdoutBenchmark()),
        },
        null,
        2
    )
);
