# Vega Vis

This component creates and renders a Vega.js visualization and provides an interface for passing properties to the Vega View instance.

A `vis` property is exposed to enable direct interaction with the Vega.js View instance. 

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

Refer to the {{docs-link "vega-vis component API" "docs.api.item" "components/vega-vis"}} for more information on the attributes.

## Rendering a Visualization

The only required property is the `spec`, a plain Javascript Object, which instructs Vega.js how to render a visualization.

Refer to [Vega.js Docs: Spec](https://vega.github.io/vega/docs/specification/) for more information.

The basic structure of the `spec` looks like:

```json
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


> The `spec` MUST contain `data`.
> 
> `spec.data` MAY contain multiple datasets, which has definitions and transforms that define the data to load and how to process it.
> 
> Each dataset in `spec.data` MAY contain `values`, which will be overwritten if `data` property passed to the component contains a matching dataset.
> 
> Refer to [Vega.js Docs: Data](https://vega.github.io/vega/docs/data/) for more information.


{{#docs-demo as |demo|}}
    {{#vega-vis-demo-basic as |spec|}}
        {{#demo.example name="vega-vis-data-basic-demo.hbs"}}
            {{vega-vis spec=spec}}
        {{/demo.example}}
    {{/vega-vis-demo-basic}}
    
    {{demo.snippet name="vega-vis-data-basic-demo.hbs"}}
    {{demo.snippet name="vega-vis-demo-basic.js" label="spec"}}
{{/docs-demo}}

## Dynamic Data

The `data` property is a mechanism for dynamic data visualization rendering.

Each dataset must also be defined in`spec.data`.

**Spec**

```json
{
    "data": [
        {"name": "foo"},
        {"name": "bar"}
    ]
}
```

**Data**

```json
{
    "foo": [],
    "bar": []
}
```

Changes to the `data` property will update the visualization.

The dataset in a `data` property may be one of three values:

1. An array.
2. A function.
3. A Vega.js Changeset instance.

> In order to update the visualization, the `data` property must be a new object. 

### Dataset as an Array

As an array, the dataset will be processed for rendering the visualization. The dataset will replace the previous dataset.

Copies of the data should be made because Vega.js Vis will mutate the dataset, so don't pass in the source.

{{#docs-demo as |demo|}}
    {{#vega-vis-demo-data-array as |spec data|}}
        {{#demo.example name="vega-vis-data-array-demo.hbs"}}
            {{vega-vis
                spec=spec
                data=data
            }}
        {{/demo.example}}
    {{/vega-vis-demo-data-array}}

    {{demo.snippet name="vega-vis-data-array.js" label="data"}}
    {{demo.snippet name="vega-vis-demo-spec.js" label="spec"}}
    {{demo.snippet name="vega-vis-data-array-actions.js" label="actions"}}
    {{demo.snippet name="vega-vis-data-array-demo.hbs" label="template"}}
{{/docs-demo}}

### Dataset as a Function

A dataset as a function provides more flexibility and control. The function is passed three arguments:

1. `vis` - the Vega.js View instance.
2. `data` - the current dataset corresponding to the dataset's name/key.
3. `change` - a changeset instance is an interface for modifying/removing/inserting data into the existing dataset.

{{#docs-demo as |demo|}}
    {{#vega-vis-demo-data-function as |spec data|}}
        {{#demo.example name="vega-vis-data-function-demo.hbs"}}
            {{vega-vis
                spec=spec
                data=data
            }}
        {{/demo.example}}
    {{/vega-vis-demo-data-function}}

    {{demo.snippet name="vega-vis-data-function.js" label="data"}}
    {{demo.snippet name="vega-vis-demo-spec.js" label="spec"}}
    {{demo.snippet name="vega-vis-data-function-actions.js" label="actions"}}
    {{demo.snippet name="vega-vis-data-function-demo.hbs"}}
{{/docs-demo}}


### Dataset as a Vega.js Changeset

A Vega.js Changeset instance will be applied on the Vega.js View instance to update the dataset with the matching name/key.

{{#docs-demo as |demo|}}
    {{#vega-vis-demo-data-changeset as |spec data|}}
        {{#demo.example name="vega-vis-data-changeset-demo.hbs"}}
            {{vega-vis
                spec=spec
                data=data
            }}
        {{/demo.example}}
    {{/vega-vis-demo-data-changeset}}

    {{demo.snippet name="vega-vis-data-changeset.js" label="data"}}
    {{demo.snippet name="vega-vis-demo-spec.js" label="spec"}}
    {{demo.snippet name="vega-vis-data-changeset-actions.js" label="actions"}}
    {{demo.snippet name="vega-vis-data-changeset-demo.hbs"}}
{{/docs-demo}}

## Changing Data with Vega.js Changeset
          
Below are some examples of modifying, removing, inserting, and replacing data by using Vega.js Changeset.

Assume that the change is within a dataset as a function.

### Modify Data

Modify a data object. `changeset.modify` accepts a data object, that exists in vega, or a function to filter for data that needs to be updated.

```javascript
function change(vis, data, change) {
    change.modify(data[0], 'someField', 123);
  
    change.modify(function(d) {
        return d.someField !== 456;
    }, 'someField', 456)
  
    vis.change('my-dataset', change);                  
}
```

### Removing Data

Remove data object(s). `changeset.remove` accepts a data object, an array of objects, or a function to filter for data that needs to be removed.
  
```javascript
function remove(vis, data, change) {
    change.remove(data[0]);
    
    change.remove([data[1], data[2]]);
    
    change.remove(function(d) {
        return d.someField >= 123;
    });
    
    vis.change('my-dataset', change);
}
```

Alternatively, the Vega.js View instance has a helper function, where the second argument is what `changeset.remove` accepts.
                    
```javascript
function remove(vis, data, change) {
    vis.remove('my-dataset', data[0]);
}
```

### Inserting/Adding Data

Insert/add data object(s). 'changeset.insert' accepts a data object or an array of objects;
  
```javascript
function insert(vis, data, change) {
    change.insert({...obj});
    
    change.insert([{...obj2}]);
    
    vis.change('my-dataset', change);
}
```

Alternatively, the Vega.js instance has a helper function, where the second argument is what `changeset.insert` accepts.

```javascript
function insert(vis, data, change) {
    vis.insert('my-dataset', {...obj});
}
```

### Replacing Data  
Replace data object(s) or datsets. `changeset` supports combination of all the methods above.

```javascript
function replace(vis, data, change) {
    change.remove(() => true).insert([...obj]);
    
    vis.change('my-dataset', change);
}
```
