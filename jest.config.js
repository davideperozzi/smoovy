module.exports = {
  projects: [
    {
      displayName: 'jsdom',
      testEnvironment: 'jsdom',
      transform: {
        "^.+\\.tsx?$": "ts-jest"
      },
    },
    {
      displayName: 'puppeteer',
      preset: 'jest-puppeteer',
      testMatch: [
        '<rootDir>/**/*.test.pptr.ts'
      ],
      transform: {
        "^.+\\.tsx?$": "ts-jest"
      },
    }
  ]
};
