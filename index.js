'use strict';

module.exports = {
    name: require('./package').name,

    isDevelopingAddon: function() {
        return true;
    },

    options: {
        babel: {
            plugins: [
                '@babel/plugin-proposal-object-rest-spread'
            ]
        }
    }
};
