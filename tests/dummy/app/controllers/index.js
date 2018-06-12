import { computed, get, set } from '@ember/object';
import { A as emberArray } from '@ember/array';
import Controller from '@ember/controller';
import { debounce } from '@ember/runloop';

export default Controller.extend({
    spec: computed(function() {
        return {
            "$schema": "https://vega.github.io/schema/vega/v3.0.json",
            "autosize": "fit",

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

                // {
                //     "name": "width",
                //     "update": "(containerSize()[0] || 400) - (padding.left + padding.right)",
                //     "on": [{
                //         "events": {"source": "window", "type": "resize"},
                //         "update": "containerSize()[0] - (padding.left + padding.right)"
                //     }]
                // },
                //
                // {
                //     "name": "height",
                //     "update": "(containerSize()[1] || 200) - (padding.top + padding.bottom)",
                //     "on": [{
                //         "events": {"source": "window", "type": "resize"},
                //         "update": "containerSize()[1] - (padding.top + padding.bottom)"
                //     }]
                // }
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

    dataSource: computed(function() {
        return emberArray([
            {"category": "A", "amount": 28},
            {"category": "B", "amount": 55},
            {"category": "C", "amount": 43},
            {"category": "D", "amount": 91},
            {"category": "E", "amount": 81},
            {"category": "F", "amount": 53},
            {"category": "G", "amount": 19},
            {"category": "H", "amount": 87}
        ]);
    }),

    // Data in an array, used for basic demo
    data: computed('dataSource.{[],@each.amount}', function() {
        const dataSource = get(this, 'dataSource');
        return {
            "table": dataSource.map((datum) => ({...datum}))
        };
    }),

    jsonStringSpec: computed('spec', function() {
        return JSON.stringify(get(this, 'spec'), null, 4);
    }),

    jsonStringData: computed('dataSource', function() {
        return JSON.stringify(get(this, 'dataSource'), null, 4);
    }),

    updateSpec(spec) {
        try {
            set(this, 'spec', JSON.parse(spec));
            set(this, 'specParseError', null);
        } catch (e) {
            set(this, 'specParseError', e);
        }
    },

    updateData(data) {
        try {
            set(this, 'dataSource',  emberArray(JSON.parse(data)));
            set(this, 'dataParseError', null);
        } catch (e) {
            set(this, 'dataParseError', e);
        }
    },

    actions: {
        updateSpec(spec) {
            debounce(this, 'updateSpec', spec, 300);
        },
        updateData(data) {
            debounce(this, 'updateData', data, 300);
        }
    }
});
