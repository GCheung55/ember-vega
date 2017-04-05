import Ember from 'ember';

export default Ember.Controller.extend({
    // spec: Ember.computed(function() {
    //     return {
    //         'width': 400,
    //         'height': 400,
    //         // 'padding': {'top': 10, 'left': 50, 'bottom': 50, right: 10},
    //         'autosize': {
    //             type: 'fit',
    //             resize: true
    //         },
    //         'data': [{
    //             'name': 'points'
    //         }],
    //         'scales': [{
    //             'name': 'x',
    //             'type': 'band',
    //             'domain': {
    //                 'data': 'points',
    //                 'field': 'distance'
    //             },
    //             'range': 'width'
    //         }, {
    //             'name': 'y',
    //             'type': 'linear',
    //             'domain': {
    //                 'data': 'points',
    //                 'field': 'value'
    //             },
    //             'range': 'height',
    //             'nice': true
    //         }],
    //         'axes': [{
    //             "orient": "bottom",
    //             "scale": "x"
    //         }, {
    //             "orient": "left",
    //             "scale": "y"
    //         }],
    //         'marks': [{
    //             'type': 'rect',
    //             'from': {
    //                 'data': 'points'
    //             },
    //             'encode': {
    //                 'enter': {
    //                     'x': {
    //                         'scale': 'x',
    //                         'field': 'distance'
    //                     },
    //                     "width": {
    //                         "scale": "x",
    //                         "band": 1,
    //                         "offset": -1
    //                     },
    //                     'y': {
    //                         'scale': 'y',
    //                         'field': 'value'
    //                     },
    //                     "y2": {
    //                         "scale": "y",
    //                         "value": 0
    //                     }
    //                 },
    //                 'update': {
    //                     'fill': [{
    //                         value: 'red'
    //                     }]
    //                 }
    //             }
    //         }]
    //     };
    // }),

    // data: Ember.computed(function () {
    //     const data = [];
    //     for (var i = 0; i <= 30; i++) {
    //         data.push({
    //             _id: i,
    //             distance: i,
    //             value: Math.random() * 10 + i
    //         });
    //     }
    //     return [{
    //         name: 'points',
    //         values: data
    //     }];
    // }),
    spec: Ember.computed(function() {
        return {
            "width": 100,
            "height": 270,
            "padding": 5,
            "scales": [{
                "name": "xscale",
                "type": "time",
                "domain": {
                    // "data": "sleepData",
                    // "field": "date"
                    "signal": "sleepTime"
                },
                // "domainMin": {
                //     "signal": "sleepTime[0]"
                // },
                // "domainMax": {
                //     "signal": "sleepTime[1]"
                // },
                "range": "width"
            }, {
                "name": "yscale",
                "domain": [0, 4],
                "range": "height"
            }, {
                "name": "durationScale",
                "type": "time",
                "domain": {
                    "data": "sleepData",
                    "field": "duration"
                },
                "range": "width"
            }, {
                "name": "sleepTime",
                "domain": {
                    "data": "summaryData",
                    "field": "time"
                },
                "range": "width"
            }],
            "axes": [{
                "orient": "bottom",
                "scale": "xscale",
                "ticks": true,
                "labels": true,
                "encode": {
                    "domain": {
                        "enter": {
                            "stroke": {
                                "value": "white"
                            },
                            "strokeOpacity": {
                                "value": 0.5
                            }
                        }
                    }
                }
            }, {
                "orient": "left",
                "scale": "yscale",
                "ticks": false,
                "domain": false,
                "labels": false
            }],
            "marks": [{
                "name": "groupMark",
                "type": "group",
                "encode": {
                    "enter": {
                        "width": {
                            "field": {
                                "group": "width"
                            }
                        },
                        "height": {
                            "field": {
                                "group": "height"
                            }
                        },
                        "y": {
                            "value": -18
                        }
                    }
                },
                "marks": [{
                    "type": "rect",
                    "name": "asleep",
                    "encode": {
                        "enter": {
                            "x": {
                                "scale": "xscale",
                                "signal": "xext[0]"
                            },
                            "width": {
                                "field": {
                                    "group": "width"
                                }
                            },
                            "y": {
                                "scale": "yscale",
                                "value": 3
                            },
                            "y2": {
                                "scale": "yscale",
                                "value": 0
                            }
                        },
                        "update": {
                            "fill": {
                                "value": "#024A80"
                            }
                        }
                    }
                }, {
                    "type": "rect",
                    "name": "not-asleep",
                    "from": {
                        "data": "restlessAndAwakeData"
                    },
                    "encode": {
                        "enter": {
                            "x": {
                                "scale": "xscale",
                                "field": "date",
                                // "offset": 1
                            },
                            "x2": {
                                "scale": "xscale",
                                "field": "duration",
                                // "offset": 1
                            },
                            "y": {
                                "scale": "yscale",
                                "value": 4
                            },
                            "y2": {
                                "scale": "yscale",
                                "value": 0
                            }
                        },
                        "update": {
                            "fill": [{
                                "test": "datum.level === 0",
                                "value": "#F13C6E"
                            }, {
                                "value": "#52BEF2"
                            }]
                        }
                    }
                }]
            }, {
                "name": "startTimeLabel",
                "type": "text",
                "encode": {
                    "update": {
                        "x": {
                            "scale": "xscale",
                            "signal": "sleepTime[0]"
                        },
                        "y": {
                            "scale": "yscale",
                            "value": 0,
                            "offset": 15
                        },
                        "fill": {
                            "value": "white"
                        },
                        "fillOpacity": {
                            "value": 0.5
                        },
                        "fontSize": {
                            "value": 14
                        },
                        "text": {
                            "signal": "timeFormat(sleepTime[0], '%I:%M %p')"
                        }
                    }
                }
            }, {
                "name": "endTimeLabel",
                "type": "text",
                "encode": {
                    "update": {
                        "x": {
                            "scale": "xscale",
                            "signal": "sleepTime[1]",
                            "offset": -60
                        },
                        "y": {
                            "scale": "yscale",
                            "value": 0,
                            "offset": 15
                        },
                        "fill": {
                            "value": "white"
                        },
                        "fillOpacity": {
                            "value": 0.5
                        },
                        "fontSize": {
                            "value": 14
                        },
                        "text": {
                            "signal": "timeFormat(sleepTime[1], '%I:%M %p')"
                        }
                    }
                }
            }]
        };
    }),

    data: Ember.computed(function() {
        return [{
            "name": "summaryData",
            "values": [{
                "time": "Friday, March 10, 2017 1:00 AM"
            }, {
                "time": "Friday, March 10, 2017 7:00 AM"
            }],
            "format": {
                "type": "json",
                "parse": {
                    "time": "date"
                }
            },
            "transform": [{
                "type": "extent",
                "field": "time",
                "signal": "sleepTime"
            }]
        }, {
            "name": "sleepData",
            "values": [{
                "date": "Friday, March 10, 2017 1:00 AM",
                "level": 1,
                "duration": "Friday, March 10, 2017 4:00 AM"
            },

            {
                "date": "Friday, March 10, 2017 4:00 AM",
                "level": 1,
                "duration": "Friday, March 10, 2017 7:00 AM"
            }
            // , {
            //     "date": "Friday, March 10, 2017 2:28 AM",
            //     "level": 0,
            //     "duration": "Friday, March 10, 2017 2:29 AM"
            // }, {
            //     "date": "Friday, March 10, 2017 2:29 AM",
            //     "level": 1,
            //     "duration": "Friday, March 10, 2017 2:31 AM"
            // },
            ],
            "format": {
                "type": "json",
                "parse": {
                    "date": "date",
                    "duration": "date"
                }
            },
            "transform": [{
                "type": "extent",
                "field": "date",
                "signal": "xext"
            }]
        }, {
            "name": "restlessAndAwakeData",
            "source": "sleepData",
            "transform": [{
                "type": "filter",
                "expr": "datum.level == 0|datum.level == 1"
            }]
        }];
    }),

    actions: {
        clickEventHandler(event, item) {
            console.log('clicked', event, item);
        },

        widthSignalHandler(name, item) {
            console.log('width', name, item);
        }
    }
});
