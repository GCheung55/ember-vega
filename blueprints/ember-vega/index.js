/*jshint node:true*/

var path = require('path');
var VersionChecker = require('ember-cli-version-checker');
var packageJSON = require(path.resolve(__dirname, '../../package.json'));
var devDependencies = packageJSON.devDependencies;

module.exports = {
    description: 'Install ember-vega dependencies.',

    /**
     * Override. ember-vega blueprint doesn't need an entity.
     * It's just run with `ember generate ember-vega`
     */
    normalizeEntityName: function(entityName) {
        return entityName;
    },

    // locals: function(options) {
    //   // Return custom template variables here.
    //   return {
    //     foo: options.entity.options.foo
    //   };
    // }

    afterInstall: function(options) {
        var checker = new VersionChecker(this);
        var packageNames = ['vega'];
        var packages = packageNames.map(function(name) {
            var satisfiesVersionCheck = checker.for(name, 'npm').satisfies(devDependencies[name]);

            if (!satisfiesVersionCheck) {
                return {
                    name: name,
                    target: devDependencies[name]
                };
            }
        }).filter(Boolean);

        if (packages.length) {
            return this.addAddonsToProject({
                packages: packages
            });
        }
    }
};
