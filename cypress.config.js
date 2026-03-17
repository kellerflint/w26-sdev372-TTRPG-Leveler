const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    supportFile: false, // This bypasses the requirement for cypress/support/e2e.js
    baseUrl: "http://localhost:80", // Update to your app's URL
  },
});
