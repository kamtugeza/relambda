/** @type {import('jest').Config} */
module.exports = {
  setupFiles: ['<rootDir>/src/globals.ts'],
  testEnvironment: 'jest-environment-node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '\\.ts$': [
      'babel-jest',
      {
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current',
              },
            },
          ],
          '@babel/preset-typescript',
        ],
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/'],
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
