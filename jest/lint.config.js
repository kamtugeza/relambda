/** @type {import('jest').Config} */
module.exports = {
  displayName: 'lint',
  runner: 'jest-runner-eslint',
  testMatch: ['<rootDir>/**/*.ts'],
  transformIgnorePatterns: ['/node_modules/'],
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
