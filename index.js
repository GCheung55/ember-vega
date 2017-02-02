/*jshint node:true*/

var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

// Taken from https://github.com/ef4/ember-browserify/blob/cea390845f15e70eedbe8530ed12f04126928459/lib/index.js
function findHost() {
    var current = this;
    var app;

    // Keep iterating upward until we don't have a grandparent.
    // Has to do this grandparent check because at some point we hit the project.
    // Stop at lazy engine boundaries.
    do {
        if (current.lazyLoading === true) {
            return current;
        }
        app = current.app || app;
    } while (current.parent && current.parent.parent && (current = current.parent));

    return app;
}

module.exports = {
    name: 'ember-vega',

    // isDevelopingAddon: function() {
    //     return true;
    // },

    included: function(app) {
        this._super.included && this._super.included.apply(this, arguments);

        app = findHost.call(this);

        this.app = app;

        app.import(path.join('vendor', 'vega', 'vega.js'), {
            using: [{
                transformation: 'amd',
                as: 'vega'
            }]
        });
    },

    treeForVendor: function(tree) {
        var trees = [];

        if (tree) {
            trees.push(tree);
        }

        var vegaPath = path.dirname(require.resolve('vega'));
        var vegaTree = new Funnel(vegaPath, {
            destDir: 'vega'
        });

        trees.push(vegaTree);

        return mergeTrees(trees);
    }
};
