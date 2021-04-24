/* eslint-disable @typescript-eslint/no-var-requires */
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
import { loadFixtures } from './tasks';

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  require('@cypress/code-coverage/task')(on, config);
  // Add other tasks to be registered here
  on('task', {
    log(x) {
      // Prints into the terminal's console
      console.log(x);

      return null;
    },
    loadFixtures,
  });

  return config;
};
