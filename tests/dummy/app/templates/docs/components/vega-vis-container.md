# Vega Vis Container

This component yields an object that contains three properties:

* `element` - the component's element.
* `dimensions` - component element's [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
* `vis` - a composed `vega-vis` component 

## Dimensions Property

The `dimensions` is bound to the `window` `resize` event, so whenever the window resizes, the `dimensions` will be updated.

It's useful for computing aspect ratios making `vega-vis` responsive.

By default, `ui.vis` will have its `height` and `width` properties set to `dimensions.height` and `dimensions.width`, respectively. 

{{#docs-demo as |demo|}}
    {{#vega-vis-demo-basic as |spec|}}
        {{#demo.example name="vega-vis-container-demo.hbs"}}
            {{#vega-vis-container as |ui|}}
                {{ui.vis 
                    spec=spec
                    height=(div ui.dimensions.width 3)
                }}
            {{/vega-vis-container}}
        {{/demo.example}}
    {{/vega-vis-demo-basic}}
    
    {{demo.snippet name="vega-vis-container-demo.hbs"}}
{{/docs-demo}}

Alternatively, a spec can have use the [`containerSize` expression](https://vega.github.io/vega/docs/expressions/#containerSize) to make the visualization responsive.

The example below show's width and height signals that update the when the windows resize event is triggered. If you have a `spec` that makes use of this feature, there is no need to use `vega-vis-container` component in this scenario.

```json
{
    "signals": [
        {
            "name": "width",
            "update": "(containerSize()[0] || 400)",
            "on": [{
                "events": {"source": "window", "type": "resize"},
                "update": "containerSize()[0]"
            }]
        },
        
        {
            "name": "height",
            "update": "(containerSize()[1] || 200)",
            "on": [{
                "events": {"source": "window", "type": "resize"},
                "update": "containerSize()[1]"
            }]
        }
    ]
}
```

## Element Property

With the `element` property, the `vega-vis` can render the visualization in a different element from it's own. This helps with reducing the number of elements in the DOM and can help with debugging.

Note that a `tagName` property is passed to `vega-vis`, along with the `visContainer`. Since `vega-vis` will be rendering the visualization in a different element, setting the `tagName` to an empty string will prevent `vega-vis` from creating an element of its own.

By default, the yielded `ui.vis` will have `visContainer` set to `ui.element` and `tagName` set to an empty string. 

{{#docs-demo as |demo|}}
    {{#vega-vis-demo-basic as |spec|}}
        {{#demo.example name="vega-vis-container-element-demo.hbs"}}
            {{#vega-vis-container as |ui|}}
                {{ui.vis 
                    spec=spec
                    visContainer=ui.element
                    height=spec.height
                    tagName=""
                }}
            {{/vega-vis-container}}
        {{/demo.example}}
    {{/vega-vis-demo-basic}}
    
    {{demo.snippet name="vega-vis-container-element-demo.hbs"}}
{{/docs-demo}}

## Vis Property

The `vis` property is a composed `vega-vis` component with some defaults set:

* The height and width is the yielded `dimensions.height` and `dimensions.width`. This will automatically make `vega-vis` responsive.
* The `vega-vis` `tagName` property is an empty string and  `visContainer` property is the yielded `element`. This automatically reduces the number of elements.

Since `vis` is a composed component, any of the defaults can be overriden.

{{#docs-demo as |demo|}}
    {{#vega-vis-demo-basic as |spec|}}
        {{#demo.example name="vega-vis-container-vis-demo.hbs"}}
            {{#vega-vis-container as |ui|}}
                {{ui.vis 
                    spec=spec
                    height=spec.height
                }}
            {{/vega-vis-container}}
        {{/demo.example}}
    {{/vega-vis-demo-basic}}
    
    {{demo.snippet name="vega-vis-container-vis-demo.hbs"}}
{{/docs-demo}}
