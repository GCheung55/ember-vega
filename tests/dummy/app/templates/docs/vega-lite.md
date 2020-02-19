# Vega-Lite

> Vega-Lite is a high-level grammar of interactive graphics. It provides a concise JSON syntax for rapidly generating visualizations to support analysis. Vega-Lite specifications can be compiled to Vega specifications.
> -- <cite>https://vega.github.io/vega-lite/</cite>

Think of Vega-Lite's specifications as the simpler version of Vega.js specifications.

**Resources**

* [Vega-Lite Documentation](https://vega.github.io/vega-lite/docs/)
* [Vega-Lite Examples](https://vega.github.io/vega-lite/examples/)
* [Vega-Lite Tutorial](https://vega.github.io/vega-lite/tutorials/getting_started.html)

## Installation

Vega-Lite is not installed with `ember-vega-vis`, so you will need to add it as a dependency in your app.

Note: Use [`ember-auto-import`](https://github.com/ef4/ember-auto-import) to simplify importing node modules. `ember-vega-vis` uses it!

With NPM:
```
npm install vega-lite
```

With Yarn:
```
yarn add vega-lite
```

## Usage

Import `vega-lite` and use it to compile a Vega-Lite specification to a Vega.js specification.

Your Component:
```javascript
import Component from '@ember/component';
import { computed } from '@ember/object';
import { compile } from 'vega-lite';

export default Component.extend({
    spec: computed(function() {
        const vegaLiteSpec = { /* ... */ };
        return compile(vegaLiteSpec).spec;
    })
});
```

Your Component's Template:
```hbs
{{vega-vis spec=spec}}
```
