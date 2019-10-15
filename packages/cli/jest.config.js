module.exports = {
  collectCoverageFrom: ['src/**/*.ts'],
  coverageReporters: ['lcov', 'html'],
  testURL: 'http://localhost',
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  testMatch: ['<rootDir>/__tests__/**/*.(ts|js)'],
  testEnvironment: 'node',
}
