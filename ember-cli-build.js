'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function (defaults) {

    let app = new EmberAddon(defaults, {
        babel: {
            // Enable spread operator in dummy app.
            plugins: [
                '@babel/plugin-proposal-object-rest-spread'
            ]
        },
        'ember-math-helpers': {
            only: ['div']
        },
        ace: {
            modes: ['handlebars', 'json'],
            workers: ['json'],
            exts: ['beautify']
        }
    });

    /*
      This build file specifies the options for the dummy test app of this
      addon, located in `/tests/dummy`
      This build file does *not* influence how the addon or the app using it
      behave. You most likely want to be modifying `./index.js` or app's build file
    */

    return app.toTree();
};
