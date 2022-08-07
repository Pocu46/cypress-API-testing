const { defineConfig } = require('cypress')

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['**/1-getting-started/*', '**/2-advanced-examples/*'],
    reporter: "cypress-multi-reporters",
    reporterOptions: {
      configFile: "reporter-config.json"
    },
    env: {
      retries: {
        runMode: 2,
        openMode: 1
      },
      username: "660000@ukr.net",
      password: "horek190689",
      apiUrl: "https://conduit.productionready.io/"
    }
  }
})
