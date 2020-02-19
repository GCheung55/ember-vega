# Usage

## Installation

Installing `ember-vega` with `ember install` will automatically run the `ember-vega` blueprint to install additional dependencies into your application.

If installing with `yarn add` or `npm install`, be sure to run the blueprint afterwards.

With Ember:

```
ember install ember-vega
```

With Yarn:
```
yarn add --dev ember-vega && ember generate ember-vega
```

With NPM:

```
npm install --dev ember-vega && ember generate ember-vega
```

## Import

Vega.js can be imported after installation.

```javascript
import vega, { changeset, parse, View } from 'vega';
```

## Components

This addon provides two components for rendering visualizations with Vega.js.

* {{docs-link 'Vega Vis' 'docs.components.vega-vis'}}
* {{docs-link 'Vega Vis Container' 'docs.components.vega-vis-container'}}