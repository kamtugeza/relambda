/** @type {import('jest').Config} */
module.exports = {
  projects: [require('./jest/lint.config')],
  watchPlugins: [
    'jest-watch-select-projects',
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}
