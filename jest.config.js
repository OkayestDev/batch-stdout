
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    collectCoverage: true,
    roots: ["<rootDir>"],
    testMatch: ["**/__tests__/**/*.test.ts"],
    coveragePathIgnorePatterns: ["benchmark.ts"],
    // setupFiles: ["<rootDir>/jest.setup.ts"],
    moduleFileExtensions: ["ts", "js", "json"],
    clearMocks: true,
    verbose: true,
    silent: false,
};

export default config;
