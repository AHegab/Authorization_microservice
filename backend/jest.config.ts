module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    rootDir: './',
    testRegex: '.*\\.spec\\.ts$',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
  };  