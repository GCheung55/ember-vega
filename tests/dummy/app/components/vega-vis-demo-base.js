import Component from '@ember/component';
import layout from '../templates/components/vega-vis-demo-base';
import { computed } from '@ember/object';

export default Component.extend({
    layout,

    // BEGIN-SNIPPET vega-vis-demo-spec.js
    spec: computed(function() {
        return {
            "$schema": "https://vega.github.io/schema/vega/v3.0.json",
            "autosize": "fit",
            "height": 200,
            "width": 200,

            "data": [
                {
                    "name": "table",
                    "values": []
                }
            ],

            "signals": [
                {
                    "name": "tooltip",
                    "value": {},
                    "on": [
                        {"events": "rect:mouseover", "update": "datum"},
                        {"events": "rect:mouseout",  "update": "{}"}
                    ]
                }
            ],

            "scales": [
                {
                    "name": "xscale",
                    "type": "band",
                    "domain": {"data": "table", "field": "category"},
                    "range": "width",
                    "padding": 0.05,
                    "round": true
                },
                {
                    "name": "yscale",
                    "domain": {"data": "table", "field": "amount"},
                    "nice": true,
                    "range": "height"
                }
            ],

            "axes": [
                {
                    "orient": "bottom",
                    "scale": "xscale",
                    "zindex": 1
                },
                { "orient": "left", "scale": "yscale" }
            ],

            "marks": [
                {
                    "type": "rect",
                    "from": {"data":"table"},
                    "encode": {
                        "update": {
                            "x": {"scale": "xscale", "field": "category"},
                            "width": {"scale": "xscale", "band": 1},
                            "y": {"scale": "yscale", "field": "amount"},
                            "y2": {"scale": "yscale", "value": 0},
                            "fill": {"value": "steelblue"}
                        },
                        "hover": {
                            "fill": {"value": "red"}
                        }
                    }
                },
                {
                    "type": "text",
                    "encode": {
                        "update": {
                            "align": {"value": "center"},
                            "baseline": {"value": "bottom"},
                            "fill": {"value": "#333"},
                            "x": {"scale": "xscale", "signal": "tooltip.category", "band": 0.5},
                            "y": {"scale": "yscale", "signal": "tooltip.amount", "offset": -2},
                            "text": {"signal": "tooltip.amount"},
                            "fillOpacity": [
                                {"test": "datum === tooltip", "value": 0},
                                {"value": 1}
                            ]
                        }
                    }
                }
            ]
        };
    }),
    // END-SNIPPET

    data: null
});
