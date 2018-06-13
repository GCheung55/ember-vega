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

Vega can be imported after installation.

```javascript
import vega, { changeset, parse, View } from 'vega';
```
