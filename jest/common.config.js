/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transformIgnorePatterns: ['/node_modules/'],
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
