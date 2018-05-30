import { getOwner } from '@ember/application';
import Component from '@ember/component';
import { computed, getProperties, get, set } from '@ember/object';
import { isPresent, typeOf } from '@ember/utils';
import { isArray } from '@ember/array';
import { changeset, parse, View } from 'vega';
import layout from '../templates/components/vega-vis';
import diffAttrs from 'ember-diff-attrs';
import { scheduleOnce } from '@ember/runloop';

export default Component.extend({
    classNames: [ 'vega-vis' ],

    layout,

    /**
     * Equality check between two padding objects.
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     */
    isSamePadding(a, b) {
        if (isPresent(a) && isPresent(b)) {
            return a.top === b.top
                && a.left === b.left
                && a.right === b.right
                && a.bottom === b.bottom;
        }
        return a === b;
    },

    /**
     * Simple equality check between two objects.
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     */
    isSameData(a, b) {
        return a === b;
    },

    /**
     * Equality check by comparing two JSON.stringify'ied objects.
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     */
    isSameSpec(a, b) {
        return a === b || JSON.stringify(a) === JSON.stringify(b);
    },

    /**
     * Determine if a value is a `vega-dataflow` changeset or not.
     * @param change
     * @returns {*|boolean}
     */
    isChangeSet(change) {
        return change && change.constructor === changeset;
    },

    /**
     * Vega visualization instance.
     *
     * @type {object|null}
     */
    vis: null,

    /**
     * Defines default visual values to set a visualization’s theme.
     *
     * Passed to create Vega visualization's runtime.
     *
     * https://vega.github.io/vega/docs/config/
     *
     * @returns {object|null}
     */
    config: null,

    /**
     * Specification of Vega visualization.
     *
     * Used to create Vega visualization's runtime.
     *
     * https://vega.github.io/vega/docs/specification/
     *
     * @returns {object}
     */
    spec: computed(function() {
        throw new Error('spec parameter is required for vega-vis');
    }),

    /**
     * Width of the visualization in pixels. If one is not defined, the `width` defined in the spec will be used.
     *
     * Passed to `view.width` method.
     *
     * https://vega.github.io/vega/docs/specification/
     * https://github.com/vega/vega-view#view_width
     *
     * @type {number|null}
     */
    width: null,

    /**
     * Height of the visualization in pixels. If one is not defined, the `height` defined in the spec will be used.
     *
     * Passed to `view.height` method
     *
     * https://vega.github.io/vega/docs/specification/
     * https://github.com/vega/vega-view#view_height
     *
     * @type {number|null}
     */
    height: null,

    /**
     * Vega visualization's background color.
     *
     * Passed to `view.background` method.
     *
     * https://github.com/vega/vega-view#view_background
     *
     * @type {string|null}
     */
    background: null,

    /**
     * Vega visualization's padding in pixels
     *
     * Passed to `view.padding` method.
     *
     * https://vega.github.io/vega/docs/specification/
     * https://github.com/vega/vega-view#view_padding
     *
     * @returns {{top: number, left: number, bottom: number, right: number}|null}
     */
    padding: computed(function() {
        return null;
    }),

    /**
     * Enable hover event processing.
     * If an object, properties `hoverSet` and `updateSet` will be passed when enabling hover event processing.
     *
     * ```javascript
     * vis.hover(enableHover.hoverSet, enableHover.updateSet)
     * ```
     *
     * https://github.com/vega/vega-view#view_hover
     *
     * @type {boolean|{hoverSet: string=, updateSet: string=}}
     */
    enableHover: true,

    /**
     * KV pairs of dataset name and array of values.
     * @returns {object.<string, (array|function)>}
     */
    data: computed(function() {
        return {};
    }),

    /**
     * Method to execute when a new visualziation has been created.
     * @param {object} vis The visualization view object.
     */
    onNewVis(vis) {}, // eslint-disable-line no-unused-vars

    /**
     * Method to execute when creating a visualization throws an error.
     * @param {object} error The error that was thrown.
     */
    onParseError(error) {}, // eslint-disable-line no-unused-vars

    /**
     * Render Vega visualization with `svg` or `canvas`.
     *
     * https://github.com/vega/vega-view#view_renderer
     *
     * @type {string}
     */
    rendererType: 'svg',

    /**
     * Set the Vega visualization log level.
     *
     * Valid values: `None`, `Warn`, `Info`, `Debug`
     *
     * https://github.com/vega/vega-view#view_logLevel
     *
     * @type {string}
     */
    logLevel: 'None',

    /**
     * Events to add to vega view instance.
     *
     * https://github.com/vega/vega-view/blob/master/README.md#view_addEventListener
     * https://github.com/vega/vega-view/blob/master/README.md#view_removeEventListener
     *
     * @type {object|null}
     */
    events: null,

    /**
     * Signal events to add to vega view instance.
     *
     * https://github.com/vega/vega-view/blob/master/README.md#view_addSignalListener
     * https://github.com/vega/vega-view/blob/master/README.md#view_removeSignalListener
     *
     * @type {object|null}
     */
    signalEvents: null,

    /**
     * Determines if the component is being rendered in Fastboot
     * @returns {object|undefined}
     */
    fastboot: computed(function() {
        return getOwner(this).lookup('service:fastboot');
    }),

    /**
     * Updates visualization due to attr changes.
     * If the spec changes, the old visualization will be removed and a whole new visualization will be created.
     */
    didReceiveAttrs: diffAttrs('spec', 'width', 'height', 'rendererType', 'logLevel', 'background', 'padding', 'data', 'enableHover', 'events', 'signalEvents', function(changedAttrs, ...args) {
        this._super(...args);

        if (changedAttrs) {
            const { spec } = changedAttrs;
            const vis = get(this, 'vis');

            if (spec) {
                const [oldSpec, newSpec] = spec;
                if (!this.isSameSpec(oldSpec, newSpec)) {
                    // Prepare vis to be replaced by "finalizing", which cleans up events that wre attached to it.
                    if (vis) {
                        vis.finalize();
                    }

                    scheduleOnce('afterRender', this, 'createVis', newSpec);
                }
            } else {
                if (vis) {
                    const {
                        data,
                        // enableHover,
                        padding,
                        events,
                        signalEvents,
                        rendererType
                    } = changedAttrs;
                    let changed = false;

                    if (events) {
                        const [oldEvents, newEvents] = events;

                        this.removeEvents(vis, oldEvents);
                        this.addEvents(vis, newEvents);
                        changed = true;
                    }

                    if (signalEvents) {
                        const [oldSignalEvents, newSignalEvents] = signalEvents;

                        this.removeSignalEvents(vis, oldSignalEvents);
                        this.addSignalEvents(vis, newSignalEvents);
                        changed = true;
                    }

                    [
                        'width',
                        'height',
                        'logLevel',
                        'background'
                    ].filter((method) => {
                        return changedAttrs[method];
                    }).map((method) => {
                        const [oldArg, newArg] = changedAttrs[method];
                        if (oldArg !== newArg) {
                            vis[method](newArg);
                            changed = true;
                        }
                    });

                    if (rendererType) {
                        const [oldRendererType, newRendererType] = rendererType;

                        if (oldRendererType !== newRendererType) {
                            vis.renderer(newRendererType);
                            changed = true;
                        }
                    }

                    if (padding) {
                        const [oldPadding, newPadding] = padding;

                        if (!this.isSamePadding(oldPadding, newPadding)) {
                            vis.padding(newPadding || spec.padding);
                            changed = true;
                        }
                    }

                    if (data) {
                        const spec = get(this, 'spec');
                        const [oldData, newData] = data.map((dataSet) => {
                            return this._normalizeData(dataSet);
                        });

                        spec.data.map((d) => {
                            const oldDataSet = oldData && oldData[d.name] || null;
                            const newDataSet = newData && newData[d.name] || null;

                            if (!this.isSameData(oldDataSet, newDataSet)) {
                                this.updateData(vis, d.name, newDataSet);
                                changed = true;
                            }
                        });
                    }

                    // hover API does not support disabling, so commenting out for now.
                    // if (enableHover) {
                    //     const [oldEnableHover, newEnableHover] = enableHover;
                    //
                    //     if (oldEnableHover !== newEnableHover) {
                    //         vis.hover();
                    //         changed = true;
                    //     }
                    // }

                    if (changed) {
                        this.visRun(vis);
                    }
                }
            }
        }
    }),

    /**
     * Executes creation of visualization.
     * @override
     */
    didInsertElement() {
        this._super(...arguments);

        scheduleOnce('afterRender', this, 'createVis', get(this, 'spec'));
    },

    /**
     * Creates a visualization from the spec and attrs.
     * Thrown errors will clear the visualization and execute `onParseError`
     */
    createVis(spec) {
        if (spec) {
            try {
                const methods = [
                    'width',
                    'height',
                    'padding',
                    'logLevel',
                    'background'
                ];
                let {
                    data,
                    config,
                    events,
                    signalEvents,
                    enableHover,
                    rendererType
                } = getProperties(this, 'data', 'config', 'events', 'signalEvents', 'enableHover', 'rendererType');
                let methodArgs = getProperties(this, ...methods);

                const runtime = parse(spec, config);
                const vis = new View(runtime);

                // Only initialize if not in fastboot.
                if (!get(this, 'fastboot')) {
                    vis.initialize(this.element);
                }

                this.addEvents(vis, events);
                this.addSignalEvents(vis, signalEvents);

                methods
                    .filter((method) => {
                        return isPresent(methodArgs[method]);
                    }).map((method) => {
                        vis[method](methodArgs[method]);
                    });

                vis.renderer(rendererType);

                if (spec.data && data) {
                    data = this._normalizeData(data);

                    spec.data.filter((d) => {
                        return data[d.name];
                    }).map((d) => {
                        this.updateData(vis, d.name, data[d.name]);
                    });
                }

                if (enableHover) {
                    let hoverSet, updateSet;

                    if (typeOf(enableHover) === 'object') {
                        ({hoverSet, updateSet} = enableHover);
                    }

                    vis.hover(hoverSet, updateSet);
                }

                this.visRun(vis);

                set(this, 'vis', vis);

                this.onNewVis(vis);

            } catch(e) {
                scheduleOnce('destroy', this, 'clearVis');

                this.onParseError(e);
            }
        }
    },

    /**
     * Prepare the visualization to be removed.
     */
    clearVis() {
        const vis = get(this, 'vis');

        if (vis) {
            // `finalize` will also remove event listeners attached to the DOM
            vis.finalize();

            set(this, 'vis', null);
        }
    },

    /**
     * Data is expected to be an object containing name/dataset pairs.
     *
     * In case the data is actually an array, convert it to an object.
     *
     * @param {object|array} data
     * @returns {object}
     * @private
     */
    _normalizeData(data) {
        if (isArray(data)) {
            data = data.reduce((acc, dataSet) => {
                const {
                    name,
                    values
                } = dataSet;

                acc[name] = values;
                return acc;
            }, {});
        }

        return data;
    },

    /**
     * Update a dataset. The value can be an array, a function, or a changeset instance.
     *
     * Where `value` is an array, the array of values will replace the existing dataset by creating a changeset instance.
     *
     * Where `value is a changeset instance, the changeset will be set on the vega instance via the `change` method.
     *
     * Where `value` is a function, the vega instance, current dataset "live" array, and a changeset instance will be
     * passed as arguments. Inserting and removing of data in the changeset, and setting the changeset on the vega
     * instance will be the responsibility of the function. Refer to the documentation below for helper methods for
     * inserting, removing, or changing data.
     *
     * `vega.change` https://github.com/vega/vega-view#view_change
     * `vega.insert` https://github.com/vega/vega-view#view_insert
     * `vega.remove` https://github.com/vega/vega-view#view_remove
     *
     * An example of the function, removing odd-numbered indexed datum:
     *
     * ```javascript
     * // component.js
     *
     * myData(vis, data, change) {
     *     change.remove((datum) => datum.id % 2 === 0);
     *     vis.change('my-data', change);
     * },
     *
     * data: computed(function() {
     *     return {
     *         'my-data': this.myData.bind(this)
     *     }
     * })
     *
     * ```
     *
     * ```html
     * {{vega-vis spec=spec data=myData}}
     * ```
     *
     * @param {object} vis
     * @param {string} name name of dataset
     * @param {function|array|object} value A function that accepts a changeset, an array of values, or a changeset instance.
     */
    updateData(vis, name, value) {
        if (vis) {
            if (value) {
                if (typeof value === 'function') {
                    value(vis, vis.data(name), changeset());
                } else {
                    // If the value isn't a change set,
                    if (!this.isChangeSet(value)) {
                        value = changeset().remove(() => true).insert(value);
                    }

                    vis.change(name, value);
                }
            }
        }
    },

    /**
     * Remove the visualization during before the component is destroyed.
     * @override
     * @returns {*}
     */
    willDestroyElement() {
        this._super(...arguments);

        scheduleOnce('destroy', this, 'clearVis');
    },

    /**
     * Invoke visualization `run` method to render the visualization.
     * Will only `run` when component hasn't been destroyed or in the process of being destroyed.
     *
     * @param {object} vis
     * @param {string|undefined} encode
     */
    visRun(vis, encode) {
        let {
            isDestroyed,
            isDestroying
        } = getProperties(this, 'isDestroyed', 'isDestroying');

        if (vis && (!isDestroyed || !isDestroying)) {
            vis.run(encode);
        }
    },

    /**
     * Abstract method to help add/remove events/signals to the visulzation.
     * @param {object} vis
     * @param {string} method Name of method, such as addEventListener or removeSignalListener
     * @param {object} events KV pairs of event/signal names and functions
     * @private
     */
    _invokeEventMethod(vis, method, events) {
        if (vis && events) {
            for (let [event, handler] of Object.entries(events)) {
                vis[method](event, handler);
            }
        }
    },

    /**
     * Adds event listeners contained in an `events` object.
     * @param {object} vis
     * @param {object} events KV pairs of event names and functions. https://github.com/vega/vega-view#view_addEventListener
     * @returns {*|undefined}
     * @private
     */
    addEvents(vis, events = {}) {
        return this._invokeEventMethod(vis, 'addEventListener', events);
    },

    /**
     * Removes event listeners contained in an `events` object.
     * @param {object} vis
     * @param {object} events KV pairs of event names and functions. https://github.com/vega/vega-view#view_removeEventListener
     * @returns {*|undefined}
     * @private
     */
    removeEvents(vis, events = {}) {
        return this._invokeEventMethod(vis, 'removeEventListener', events);
    },

    /**
     * Adds signal event listeners contained in a `signalevents` object.
     * @param {object} vis
     * @param {object} signalEvents KV pairs of signal evnet names and functions. https://github.com/vega/vega-view#view_addSignalListener
     * @returns {*|undefined}
     * @private
     */
    addSignalEvents(vis, signalEvents = {}) {
        return this._invokeEventMethod(vis, 'addSignalListener', signalEvents);
    },

    /**
     * Removes signal event listeners contained in a `signalevents` object.
     * @param {object} vis
     * @param {object} signalEvents KV pairs of signal evnet names and functions. https://github.com/vega/vega-view#view_addSignalListener
     * @returns {*|undefined}
     * @private
     */
    removeSignalEvents(vis, signalEvents = {}) {
        return this._invokeEventMethod(vis, 'removeSignalListener', signalEvents);
    }
});
