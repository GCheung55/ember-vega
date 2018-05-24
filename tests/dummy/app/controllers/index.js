import { computed, set } from '@ember/object';
import Controller from '@ember/controller';

export default Controller.extend({
    spec: computed(function() {
        return {
            "$schema": "https://vega.github.io/schema/vega/v3.0.json",
            "autosize": "fit",
            "padding": 5,

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
                    "update": "(containerSize()[0] || 400) - (padding.left + padding.right)",
                    "on": [{
                        "events": {"source": "window", "type": "resize"},
                        "update": "containerSize()[0] - (padding.left + padding.right)"
                    }]
                },

                {
                    "name": "height",
                    "update": "(containerSize()[1] || 200) - (padding.top + padding.bottom)",
                    "on": [{
                        "events": {"source": "window", "type": "resize"},
                        "update": "containerSize()[1] - (padding.top + padding.bottom)"
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

    clickCount: 0,
    widthSignal: null,
    parseErrorObject: null,

    actions: {
        // eslint-disable-next-line no-unused-vars
        clickEventHandler(event, item) {
            this.incrementProperty('clickCount');
        },

        // eslint-disable-next-line no-unused-vars
        widthSignalHandler(name, item) {
            set(this, 'widthSignal', item);
        },

        // eslint-disable-next-line no-unused-vars
        newVis(vis) {
            set(this, 'parseErrorObject', null);
        },

        parseError(error) {
            set(this, 'parseErrorObject', error);
        }
    }
});
