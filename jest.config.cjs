/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    testEnvironment: 'node',
    "roots": [
        "<rootDir>/src"
    ],
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
    },
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node",
    ],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/build/'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|js)x?$',
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: ['/<rootDir>/strategies/'],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx,js,jsx}',
        '!src/**/*.d.ts',
    ],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
};
