ember-vega
==============================================================================

Ember addon to use vega, a visualization grammar built on D3.js

[Check Vega documentation](https://github.com/vega/vega/wiki/Documentation).

Installation
------------------------------------------------------------------------------

```
ember install ember-vega
```


Usage
------------------------------------------------------------------------------

`ember-vega` provides two components and enables importing of the `vega`.

### Component - `vega-vis`

Render Vega visualization.

```handlebars
{{vega-vis
    vis=vis
    config=config
    data=data
    spec=spec
    height=100
    width=200
    padding=(hash top=10 bottom=10 left=10 right=10)
    background="#000"
    enableHover=true
    rendererType="svg"
    logLevel="None"
    events=(hash click=(action "click"))
    signalEvents=(hash foo=(action "fooSignalChanged"))
    onParseError=(action "parseError")
    onNewVis=(action "newVisCreated")
}}
```
#### spec [Docs](https://vega.github.io/vega/docs/specification/) (Object) - Required

Default: Throw error - spec must be given to `vega-vis`.

A Vega specification defines an interactive visualization in JSON.

A new vega instance will be created when `spec` changes.

Example base specification:

```javascript
{
  "description": "A specification outline example.",
  "width": 500,
  "height": 200,
  "padding": 5,
  "autosize": "pad",

  "signals": [],
  "data": [],
  "scales": [],
  "projections": [],
  "axes": [],
  "legends": [],
  "marks": []
}
```

#### vis [Docs](https://github.com/vega/vega-view/blob/master/README.md)

Vega visualization instance. Useful for interacting with the vega instance once it's been created.

#### config [Docs](https://vega.github.io/vega/docs/config/) (Object) - Optional.

Defines default visual values to set a visualization’s theme.

#### data [Docs](https://vega.github.io/vega/docs/data/) (Object|Array) - Optional

Data used to render the vega visualization.

`ember-vega` supports two data structures, an array of datasets as described in the Vega docs, and a simple KV pair of dataset name and values. 

1. Array of datasets as Vega's docs describes.

    ```javascript
    [
        { name: 'table', values: [1,2,3,4,5] }
    ]
    ```

2. KV pairs of dataset name and array values.

    ```javascript
    {
        table: [1,2,3,4,5],
        table2(vis, data) {},
        table3: vega.changeset().remove(() => true).insert([1,2,3,4,5])
    }
    ```
    
    The values can be of 3 types:
    
    * Array of values - The array of values will replace the existing dataset.
    * A changeset instance - A changeset will be automatically set to the corresponding dataset name on the vega instance. Learn more about changesets in the "Function" bullet point.
    * Function - Responsible for modifying/remove/insert of data.
        * Params
            * [`vis`](https://github.com/vega/vega-view/blob/master/README.md#data) (Vega Instance)
                Vega visualization instance.
            * [`data`]((https://github.com/vega/vega-view/blob/master/README.md#data)) (Array)
                Dataset array corresponding to the dataset name.
            * [`change`]((https://github.com/vega/vega-view/blob/master/README.md#data)) (Vega Changeset Instance)
                Used to modify/remove/insert a change. Suggested to pass copies of data to vega as vega will modify the dataset.
              
                Below are some examples of modifying, removing, inserting, and replacing data.
              
                * Modify a data object. `changeset.modify` accepts a data object, that exists in vega, or a function to filter for data that needs to be updated.
              
                    ```javascript
                    function(vis, data, change) {
                        change.modify(data[0], 'someField', 123);
                      
                        change.modify(function(d) {
                            return d.someField !== 456;
                        }, 'someField', 456)
                      
                        vis.change('my-dataset', change);                  
                    }
                    ```
                * Remove data object(s). `changeset.remove` accepts a data object, an array of objects, or a function to filter for data that needs to be removed.
                  
                    ```javascript
                    function(vis, data, change) {
                        change.remove(data[0]);
                        
                        change.remove([data[1], data[2]]);
                        
                        change.remove(function(d) {
                            return d.someField >= 123;
                        });
                        
                        vis.change('my-dataset', change);
                    }
                    ```
                    
                    Alternatively, the vega instance has a helper function, where the second argument is what `changeset.remove` accepts.
                                        
                    ```javascript
                    function(vis, data, change) {
                        vis.remove('my-dataset', data[0]);
                    }
                    ```
                
                * Insert data object(s). 'changeset.insert' accepts a data object or an array of objects;
                  
                    ```javascript
                    function(vis, data, change) {
                        change.insert({...obj});
                        
                        change.insert([{...obj2}]);
                        
                        vis.change('my-dataset', change);
                    }
                    ```
                    
                    Alternatively, the vega instance has a helper function, where the second argument is what `changeset.insert` accepts.
                    
                    ```javascript
                    function(vis, data, change) {
                        vis.insert('my-dataset', {...obj});
                    }
                    ```
                  
                * Replace data object(s) or datsets. `changeset` supports combination of all the methods above.
                
                    ```javascript
                    function(vis, data, change) {
                        change.remove(() => true).insert([...obj]);
                        
                        vis.change('my-dataset', change);
                    }
                    ```

#### height [Docs](https://vega.github.io/vega/docs/specification/) (Number) - Optional

Default: `null`

Height of the visualization in pixels. If one is not defined, the `height` defined in the spec will be used.

#### width [Docs](https://vega.github.io/vega/docs/specification/) (Number) - Optional

Default: `null`

Width of the visualization in pixels. If one is not defined, the `width` defined in the spec will be used.

#### padding [Docs](https://vega.github.io/vega/docs/specification/) (Number) - Optional 

Default: `null`

The padding in pixels to add around the visualization. If a number, specifies padding for all sides. If an object, the value should have the format `{"left": 5, "top": 5, "right": 5, "bottom": 5}`. Padding is applied after autosize layout completes.

#### background [Docs](https://vega.github.io/vega/docs/specification/) (String) - Optional 

Default: `null`

The background color of the entire view (defaults to transparent).

#### enableHover [Docs](https://github.com/vega/vega-view#view_hover) (Boolean) - Optional

Default: `true`

Enable hover event processing.

#### rendererType [Docs](https://github.com/vega/vega-view#view_renderer) (String) - Optional
Default: `'svg'`

Render Vega visualization with `svg` or `canvas`.

#### logLevel [Docs](https://github.com/vega/vega-view#view_logLevel) (String) - Optional

Default: `'Warn'`

Set the Vega visualization log level. Valid values: `None`, `Warn`, `Info`, `Debug`

#### events [Docs](https://github.com/vega/vega-view/blob/master/README.md#view_addEventListener) (Object) - Optional

Default: `null`

Events to add to vega view instance. Useful for handling mouse/touch interactive events.

#### signalEvents [Docs](https://github.com/vega/vega-view/blob/master/README.md#view_addSignalListener) (Object) - Optional

Default: `null`

Signal events to add to vega view instance. Useful for observing changes to signals.

#### onParseError (Function) - Optional

Default: No-op function

Surface errors during vega instance creation process

Parameters:
    * `error` (Error)
        Thrown error during vega instance creation.

#### onNewVis (Function) - Optional

Default: No-op function

Event handler triggered every time vega instance is successfully created.

### Component - `vega-vis-container-dimensions`

Yield component element's `dimensions`. `dimensions` will be updated when `window` `resize` event is triggered.

Useful for rendering `vega-vis` with an aspect ratio. Below is an example of computing the height with an aspect ratio by utilizing [`ember-math-helpers`](https://github.com/shipshapecode/ember-math-helpers).

```handlebars
{{#vega-vis-container-dimensions as |dimensions|}}
    {{vega-vis
        height=(div dimensions.width 4.259259259) 
        width=dimensions.width
        spec=spec
        data=data
    }}
{{/vega-vis-container-dimensions}}
```

#### dimensions [Docs](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect) (Object)
Yielded computed property.

Return value from [`this.element.getBoundingClientRect()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect). 

### Import

Access `vega` modules:

```javascript
import vega, { changeset, parse, View } from 'vega';
```

Contributing
------------------------------------------------------------------------------

### Installation

* `git clone https://github.com/GCheung55/ember-vega.git`
* `cd ember-vega`
* `yarn install`

### Linting

* `yarn lint:js`
* `yarn lint:js --fix`

### Running tests

* `ember test` – Runs the test suite on the current Ember version
* `ember test --server` – Runs the test suite in "watch mode"
* `ember try:each` – Runs the test suite against multiple Ember versions

### Running the dummy application

* `ember serve`
* Visit the dummy application at [http://localhost:4200](http://localhost:4200).

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).

License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).
