export default {
  testDir: '.',
  testMatch: 'cv-builder-verification.spec.js',
  outputDir: '../test-results/cv-builder',
  timeout: 120000,
  use: {
    channel: 'chrome',
  },
}
