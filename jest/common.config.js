/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jest-environment-node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: {
    '\\.[jt]s$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env'], '@babel/preset-typescript'],
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
