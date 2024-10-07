module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts', '**/*Tests.ts'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
  };