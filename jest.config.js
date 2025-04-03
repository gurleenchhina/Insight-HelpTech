
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
};
