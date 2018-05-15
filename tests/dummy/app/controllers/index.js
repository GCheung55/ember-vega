import { computed } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
    spec: computed(function() {
        return {
            "$schema": "https://vega.github.io/schema/vega/v3.0.json",
            "padding": 5,
            "autosize": {
                "type": "fit",
                // "resize": true,
                "contains": "padding"
            },

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
                },

                {
                    "name": "width",
                    "update": "(containerSize()[0] || 400) - ((padding.left + padding.right) * 1)",
                    "on": [{
                        "events": {"source": "window", "type": "resize"},
                        "update": "containerSize()[0] - ((padding.left + padding.right) * 1)"
                    }]
                },

                {
                    "name": "height",
                    "update": "(containerSize()[1] || 200) - ((padding.top + padding.bottom) * 1)",
                    "on": [{
                        "events": {"source": "window", "type": "resize"},
                        "update": "containerSize()[1] - ((padding.top + padding.bottom) * 1)"
                    }]
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
                    "offset": {
                        "signal": "-5 * (padding.top + padding.bottom)"
                    },
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

    data: computed(function() {
        return {
            "table": [
                {"category": "A", "amount": 28},
                {"category": "B", "amount": 55},
                {"category": "C", "amount": 43},
                {"category": "D", "amount": 91},
                {"category": "E", "amount": 81},
                {"category": "F", "amount": 53},
                {"category": "G", "amount": 19},
                {"category": "H", "amount": 87}
            ]
        };
    }),

    actions: {
        clickEventHandler(event, item) {
            console.log('clicked', event, item);
        },

        widthSignalHandler(name, item) {
            console.log('width', name, item);
        },

        parseError(error) {
            console.log('error', error);
        }
    }
});
