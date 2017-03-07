import Ember from 'ember';

export default Ember.Controller.extend({
    spec: Ember.computed(function() {
        return {
            'width': 400,
            'height': 400,
            // 'padding': {'top': 10, 'left': 50, 'bottom': 50, right: 10},
            'autosize': {
                type: 'fit',
                resize: true
            },
            'data': [{
                'name': 'points'
            }],
            'scales': [{
                'name': 'x',
                'type': 'band',
                'domain': {
                    'data': 'points',
                    'field': 'distance'
                },
                'range': 'width'
            }, {
                'name': 'y',
                'type': 'linear',
                'domain': {
                    'data': 'points',
                    'field': 'value'
                },
                'range': 'height',
                'nice': true
            }],
            'axes': [{
                "orient": "bottom",
                "scale": "x"
            }, {
                "orient": "left",
                "scale": "y"
            }],
            'marks': [{
                'type': 'rect',
                'from': {
                    'data': 'points'
                },
                'encode': {
                    'enter': {
                        'x': {
                            'scale': 'x',
                            'field': 'distance'
                        },
                        "width": {
                            "scale": "x",
                            "band": 1,
                            "offset": -1
                        },
                        'y': {
                            'scale': 'y',
                            'field': 'value'
                        },
                        "y2": {
                            "scale": "y",
                            "value": 0
                        }
                    },
                    'update': {
                        'fill': [{
                            value: 'red'
                        }]
                    }
                }
            }]
        };
    }),

    data: Ember.computed(function () {
        const data = [];
        for (var i = 0; i <= 30; i++) {
            data.push({
                _id: i,
                distance: i,
                value: Math.random() * 10 + i
            });
        }
        return [{
            name: 'points',
            values: data
        }];
    }),
});
