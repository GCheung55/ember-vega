import { getOwner } from '@ember/application';
import Component from '@ember/component';
import { computed, getProperties, get, set } from '@ember/object';
import { isPresent } from '@ember/utils';
import { isArray } from '@ember/array';
import vg from 'vega';
import layout from '../templates/components/vega-vis';
import diffAttrs from 'ember-diff-attrs';

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
     * Vega visualization's width in pixels
     *
     * Passed to `view.width` method.
     *
     * https://github.com/vega/vega-view#view_width
     *
     * @type {number|null}
     */
    width: null,

    /**
     * Vega visualization height in pixels
     *
     * Passed to `view.height` method
     *
     * https://github.com/vega/vega-view#view_background
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
     * https://github.com/vega/vega-view#view_padding
     *
     * @returns {{top: number, left: number, bottom: number, right: number}|null}
     */
    padding: computed(function() {
        return null;
    }),

    /**
     * Enable hover event processing.
     *
     * https://github.com/vega/vega-view#view_hover
     *
     * @type {boolean}
     */
    enableHover: true,

    /**
     * KV pairs of dataset name and array of values.
     * @returns {object}
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
     * @type {object|null}
     */
    events: null,

    /**
     * Signal events to add to vega view instance.
     * @type {object|null}
     */
    signalEvents: null,

    /**
     * Determines if the component is being rendered in Fastboot
     * @returns {object|undefined}
     */
    fastboot: computed(function() {
        let owner = getOwner(this);

        return owner.lookup('service:fastboot');
    }),

    /**
     * Updates visualization due to attr changes.
     * If the spec changes, the old visualization will be removed and a whole new visualization will be created.
     */
    didUpdateAttrs: diffAttrs('spec', 'width', 'height', 'rendererType', 'logLevel', 'background', 'padding', 'data', 'enableHover', 'events', 'signalEvents', function(changedAttrs, ...args) {
        this._super(...args);

        if (changedAttrs) {
            const { spec } = changedAttrs;

            if (spec) {
                const [oldSpec, newSpec] = spec;
                if (!this.isSameSpec(oldSpec, newSpec)) {
                    this.clearView();
                    this.createView(newSpec);
                }
            } else {
                const vis = get(this, 'vis');

                if (vis) {
                    const {
                        data,
                        enableHover,
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
                            const oldDataSet = oldData[d.name];
                            const newDataSet = newData[d.name];

                            if (!this.isSameData(oldDataSet, newDataSet)) {
                                this.updateData(d.name, newDataSet);
                                changed = true;
                            }
                        });
                    }

                    if (enableHover) {
                        const [oldEnableHover, newEnableHover] = enableHover;

                        if (oldEnableHover !== newEnableHover) {
                            vis.hover();
                            changed = true;
                        }
                    }

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
     * @returns {*}
     */
    didInsertElement() {
        this.createVis();

        return this._super(...arguments);
    },

    /**
     * Creates a visualization from the spec and attrs.
     * Thrown errors will clear the visualization and execute `onParseError`
     */
    createVis() {
        const spec = get(this, 'spec');

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

                const runtime = vg.parse(spec, config);
                const vis = new vg.View(runtime);

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
                    vis.hover();
                }

                this.visRun(vis);

                set(this, 'vis', vis);

                this.onNewVis(vis);

            } catch(e) {
                this.clearVis();
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
                    value
                } = dataSet;

                acc[name] = value;
                return acc;
            }, {});
        }

        return data;
    },

    /**
     * Update a dataset.
     * @param {object} vis
     * @param {string} name name of dataset
     * @param {function|array} value A function that accepts a changeset or an array of values.
     */
    updateData(vis, name, value) {
        if (vis) {
            if (value) {
                if (typeof value === 'function') {
                    value(vis.data(name));
                } else {
                    const changeset = vg.changeset().remove(() => true).insert(value);
                    vis.change(name, changeset);
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
        this.clearVis();

        return this._super(...arguments);
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
