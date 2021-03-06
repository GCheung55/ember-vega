import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';
import config from './config/environment';

const Router = AddonDocsRouter.extend({
    location: config.locationType,
    rootURL: config.rootURL,
});

Router.map(function() {
  docsRoute(this, function() {
      this.route('usage');
      this.route('vega-lite');

      this.route('components', function() {
          this.route('vega-vis');
          this.route('vega-vis-container');
      });
  });

  this.route('not-found', { path: '/*path' });
});

export default Router;
