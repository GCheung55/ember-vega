/*jshint node:true*/

var path = require('path');
var Funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

module.exports = {
    name: 'ember-vega',

    isDevelopingAddon: function () {
        return true;
    },

    /**
     * `import()` taken from ember-cli 2.7
     * @private
     */
    import(asset, options) {
        var app = this.app;
        while (app.app) {
            app = app.app;
        }

        app.import(asset, options);
    },

    included: function(app) {
        this._super.included && this._super.included.apply(this, arguments);
        this.app = app;

        this.import(path.join('vendor', 'vega', 'vega.js'), {
            using: [
                { transformation: 'amd', as: 'vega' }
            ]
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
