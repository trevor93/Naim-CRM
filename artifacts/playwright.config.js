export default {
  testDir: '.',
  testMatch: '*.spec.js',
  timeout: 120000,
  use: {
    browserName: 'chromium',
    channel: 'chrome',
    headless: true,
    trace: 'retain-on-failure',
  },
  reporter: [['list']],
}
