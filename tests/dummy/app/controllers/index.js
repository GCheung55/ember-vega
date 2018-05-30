import { computed, get, set } from '@ember/object';
import { A as emberArray } from '@ember/array';
import { changeset } from 'vega';
import Controller from '@ember/controller';

export default Controller.extend({
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

    data: computed('dataSource.{[],@each.amount}', function() {
        const dataSource = get(this, 'dataSource');
        return {
            "table": dataSource.map((datum) => ({...datum}))
        };
    }),

    data2: computed('dataSource.{[],@each.amount}', function() {
        const dataSource = get(this, 'dataSource');
        return {
            "table": dataSource.map((datum) => ({...datum}))
        };
    }),

    data3: computed('dataSource.{[],@each.amount}', function() {
        return {
            "table": this.changeData.bind(this)
        };
    }),

    // eslint-disable-next-line no-unused-vars
    changeData(vis, data) {
        const dataSource = get(this, 'dataSource');

        if (dataSource.length !== 0) {
            const change = changeset().remove(() => true).insert(dataSource.map((datum) => ({...datum})));
            vis.change('table', change);
        } else {
            vis.change('table', changeset().remove(data));
        }
    },

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
        },

        addData() {
            const table = get(this, 'dataSource');
            const lastObject = get(table, 'lastObject');
            let obj = {
                category: 'A',
                amount: Math.round(Math.random() * 100)
            };

            if (lastObject) {
                const lastCategory = lastObject.category;
                const category = lastCategory.substring(0, lastCategory.length - 1) + String.fromCharCode(lastCategory.charCodeAt(lastCategory.length - 1) + 1);
                obj.category = category;
            }

            table.pushObject(obj);
        },

        removeData() {
            const table = get(this, 'dataSource');
            const lastObject = get(table, 'lastObject');

            if (lastObject) {
                table.removeObject(lastObject);
            }
        },

        changeData() {
            const table = get(this, 'dataSource');
            const lastObject = get(table, 'lastObject');

            if (lastObject) {
                const amount = Math.round(Math.random() * 100);
                set(lastObject, 'amount', amount);
            }
        }
    }
});
