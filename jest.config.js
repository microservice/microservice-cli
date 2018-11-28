module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
  ],
  coverageReporters: [
    'lcov',
    'html',
  ],
  testURL: 'http://localhost',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.(ts|js)',
  ],
  testEnvironment: 'node',
};
