import { getOwner } from '@ember/application';
import Component from '@ember/component';
import { computed, getProperties, get, set } from '@ember/object';
import { isPresent, typeOf } from '@ember/utils';
import { isArray } from '@ember/array';
import { changeset, parse, View, None, Error as VegaLogError, Warn, Info, Debug } from 'vega';
import layout from '../templates/components/vega-vis';
import diffAttrs from 'ember-diff-attrs';
import { scheduleOnce } from '@ember/runloop';

/**
 * A component for rendering a Vega visualization.
 *
 * ```hbs
 * {{vega-vis
 *    vis=vis
 *    config=config
 *    data=data
 *    spec=spec
 *    height=100
 *    width=200
 *    padding=(hash top=10 bottom=10 left=10 right=10)
 *    background="#000"
 *    enableHover=true
 *    rendererType="svg"
 *    logLevel="None"
 *    events=(hash click=(action "click"))
 *    signalEvents=(hash foo=(action "fooSignalChanged"))
 *    onParseError=(action "parseError")
 *    onNewVis=(action "newVisCreated")
 *}}
 * ```
 *
 * @class VegaVis
 * @public
 */
export default Component.extend({
    classNames: [ 'vega-vis' ],

    layout,

    LOG_LEVELS: computed(function() {
        return {
            None,
            Error: VegaLogError,
            Warn,
            Info,
            Debug
        };
    }),

    /**
     * Equality check between two padding objects.
     *
     * @method isSamePadding
     * @param {any} a
     * @param {any} b
     * @return {Boolean}
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
     *
     * @method isSameData
     * @param {any} a
     * @param {any} b
     * @return {Boolean}
     */
    isSameData(a, b) {
        return a === b;
    },

    /**
     * Equality check by comparing two JSON.stringify'ied objects.
     *
     * @method isSameSpec
     * @param {any} a
     * @param {any} b
     * @return {Boolean}
     */
    isSameSpec(a, b) {
        return a === b || JSON.stringify(a) === JSON.stringify(b);
    },

    /**
     * Determine if a value is a `vega-dataflow` changeset or not.
     *
     * @method isChangeSet
     * @param {Vega.Changeset} change
     * @return {Boolean}
     */
    isChangeSet(change) {
        return change && change.constructor === changeset;
    },

    /**
     * Vega visualization instance.
     *
     * [Vega Docs: View](https://vega.github.io/vega/docs/api/view/)
     *
     * @argument vis
     * @default null
     * @type {Vega.View}
     */
    vis: null,

    /**
     * Defines default visual values to set a visualization’s theme.
     *
     * Passed to create Vega visualization's runtime.
     *
     * [Vega Docs: Config](https://vega.github.io/vega/docs/config/)
     *
     * @argument config
     * @optional
     * @default null
     * @type {Object}
     */
    config: null,

    /**
     * Specification of Vega visualization.
     *
     * Used to create Vega visualization's runtime.
     *
     * [Vega Docs: Specification](https://vega.github.io/vega/docs/specification/)
     *
     * @argument spec
     * @computed spec
     * @required
     * @type {Object}
     */
    spec: computed({
        get() {
            throw new Error('spec parameter is required for vega-vis');
        },
        set(key, value) { return value; }
    }),

    /**
     * Width of the visualization in pixels. If one is not defined, the `width` defined in the spec will be used.
     *
     * Passed to `view.width` method.
     *
     * [Vega Docs: Specification](https://vega.github.io/vega/docs/specification/)
     * [Vega Docs: View.width](https://vega.github.io/vega/docs/api/view/#view_width)
     *
     * @argument width
     * @default null
     * @optional
     * @type {Number|null}
     */
    width: null,

    /**
     * Height of the visualization in pixels. If one is not defined, the `height` defined in the spec will be used.
     *
     * Passed to `view.height` method
     *
     * [Vega Docs: Specification](https://vega.github.io/vega/docs/specification/)
     * [Vega Docs: View.height](https://vega.github.io/vega/docs/api/view/#view_height)
     *
     * @argument height
     * @default null
     * @optional
     * @type {Number|null}
     */
    height: null,

    /**
     * Vega visualization's background color.
     *
     * Passed to `view.background` method.
     *
     * [Vega Docs: Specification](https://vega.github.io/vega/docs/specification/)
     * [Vega Docs: View.background](https://vega.github.io/vega/docs/api/view/#view_background)
     *
     * @argument background
     * @default null
     * @optional
     * @type {String|null}
     */
    background: null,

    /**
     * Vega visualization's padding in pixels.
     *
     * Passed to `view.padding` method.
     *
     * [Vega Docs: Specification](https://vega.github.io/vega/docs/specification/)
     * [Vega Docs: View.padding](https://vega.github.io/vega/docs/api/view/#view_padding)
     *
     * @argument padding
     * @optional
     * @type {Object|null}
     * @param {Number} top
     * @param {Number} bottom
     * @param {Number} left
     * @param {Number} right
     */
    padding: null,

    /**
     * Enable hover event processing.
     * If an object, properties `hoverSet` and `updateSet` will be passed when enabling hover event processing.
     *
     * ```javascript
     * vis.hover(enableHover.hoverSet, enableHover.updateSet)
     * ```
     *
     * [Vega Docs: View.hover](https://vega.github.io/vega/docs/api/view/#view_hover)
     *
     * @argument enableHover
     * @default true
     * @type {Boolean|Object}
     * @param {String} [hoverSet]
     * @param {String} [updateSet]
     */
    enableHover: true,

    /**
     * KV pairs of dataset name and array of values, a changeset, or a function.
     *
     * Where `value` is an array, the array of values will replace the existing dataset by creating a changeset instance.
     *
     * Where `value is a changeset instance, the changeset will be set on the Vega.View instance via the `change` method.
     *
     * Where `value` is a function, the Vega.View instance, current dataset "live" array, and a changeset instance will be
     * passed as arguments. Inserting and removing of data in the changeset, and setting the changeset on the vega
     * instance will be the responsibility of the function. Refer to the documentation below for helper methods for
     * inserting, removing, or changing data.
     *
     * [Vega Docs: View.change](https://github.com/vega/vega-view#view_change)
     * [Vega Docs: View.insert](https://github.com/vega/vega-view#view_insert)
     * [Vega Docs: View.remove](https://github.com/vega/vega-view#view_remove)
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
     * {{vega-vis spec=spec data=data}}
     * ```
     *
     * [Vega Docs: Data](https://vega.github.io/vega/docs/data/)
     *
     * @argument data
     * @computed data
     * @type {Object.<String, (Array|Function)>}
     */
    data: computed({
        get() {
            return {};
        },
        set(key, value) { return value; }
    }),

    /**
     * Method to execute when a new visualziation has been created.
     *
     * @argument onNewVis
     * @type {Function}
     * @param {Vega.View} vis The visualization view object.
     */
    onNewVis(vis) {}, // eslint-disable-line no-unused-vars

    /**
     * Method to execute when creating a visualization throws an error.
     *
     * @argument onParseError
     * @type {Function}
     * @param {Error} error The error that was thrown.
     */
    onParseError(error) {}, // eslint-disable-line no-unused-vars

    /**
     * Render Vega visualization with `svg` or `canvas`.
     *
     * [Vega Docs: View.renderer](https://vega.github.io/vega/docs/api/view/#view_renderer)
     *
     * @argument rendererType
     * @default 'svg'
     * @type {string}
     */
    rendererType: 'svg',

    /**
     * Set the Vega visualization log level.
     *
     * Valid values: `None`, `Warn`, `Info`, `Debug`
     *
     * [Vega Docs: View.logLevel](https://vega.github.io/vega/docs/api/view/#view_logLevel)
     *
     * @argument logLevel
     * @default 'None'
     * @type {string}
     */
    logLevel: 'None',

    /**
     * Events to add to vega view instance.
     *
     * [Vega Docs: View.addEventListener](https://vega.github.io/vega/docs/api/view/#view_addEventListener)
     * [Vega Docs: View.removeEventListener](https://vega.github.io/vega/docs/api/view/#view_removeEventListener)
     *
     * @argument events
     * @default null
     * @type {Object|null}
     */
    events: null,

    /**
     * Signal events to add to Vega View instance.
     *
     * [Vega Docs: View.addSignalListener](https://vega.github.io/vega/docs/api/view/#view_addSignalListener)
     * [Vega Docs: View.removeSignalListener](https://vega.github.io/vega/docs/api/view/#view_removeSignalListener)
     *
     * @argument signalEvents
     * @default null
     * @type {Object|null}
     */
    signalEvents: null,

    /**
     * Determines if the component is being rendered in Fastboot.
     *
     * @computed fastboot
     * @type {Object|undefined}
     */
    fastboot: computed(function() {
        return getOwner(this).lookup('service:fastboot');
    }),

    /**
     * Container element for rendering the Vega View instance.
     *
     * The visualization can be rendered in a different container if desired. This helps with reducing the number of elements.
     *
     * The example also sets the `tagName` property to an empty string, this effectively prevents `vega-vis` from creating its own element.
     *
     * ```hbs
     * {{#foo-thing as |element|}}
     *     {{vega-vis spec=spec container=element tagName=""}}
     * {{/foo-thing}}
     * ```
     *
     * @computed container
     * @argument container
     * @default {Element} The component's element.
     * @type {Element}
     */
    visContainer: computed({
        get() {
            return get(this, 'element');
        },
        set(key, value) { return value; }
    }),

    /**
     * Updates visualization due to attr changes.
     * If the spec changes, the old visualization will be removed and a whole new visualization will be created.
     *
     * @method didReceiveAttrs
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
                        rendererType,
                        logLevel
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

                    if (logLevel) {
                        const newLogLevel = logLevel[1];
                        const LOG_LEVELS = get(this, 'LOG_LEVELS');
                        const foundLogLevel = LOG_LEVELS[newLogLevel];

                        if (isPresent(foundLogLevel)) {
                            vis.logLevel(foundLogLevel);
                        }
                    }

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
     *
     * @method didInsertElement
     */
    didInsertElement() {
        this._super(...arguments);

        scheduleOnce('afterRender', this, 'createVis', get(this, 'spec'));
    },

    /**
     * Creates a visualization from the spec and attrs.
     * Thrown errors will clear the visualization and execute `onParseError`
     *
     * @method createVis
     * @param {Object} spec The specification used to create a Vega.View instance
     */
    createVis(spec) {
        if (spec) {
            try {
                const methods = [
                    'width',
                    'height',
                    'padding',
                    'background'
                ];
                let {
                    data,
                    config,
                    events,
                    signalEvents,
                    enableHover,
                    rendererType,
                    logLevel,
                    visContainer,
                    LOG_LEVELS
                } = getProperties(this, 'data', 'config', 'events', 'signalEvents', 'enableHover', 'rendererType', 'logLevel', 'visContainer', 'LOG_LEVELS');
                const foundLogLevel = LOG_LEVELS[logLevel];
                let methodArgs = getProperties(this, ...methods);

                const runtime = parse(spec, config);
                const vis = new View(runtime);

                // Only initialize if not in fastboot.
                if (!get(this, 'fastboot')) {
                    vis.initialize(visContainer);
                }

                this.addEvents(vis, events);
                this.addSignalEvents(vis, signalEvents);

                if (isPresent(foundLogLevel)) {
                    vis.logLevel(foundLogLevel);
                }

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
                scheduleOnce('afterRender', this, 'clearVis');

                this.onParseError(e);
            }
        }
    },

    /**
     * Prepare the visualization to be removed.
     *
     * @method clearVis
     */
    clearVis() {
        const vis = get(this, 'vis');

        if (vis) {
            // `finalize` will also remove event listeners attached to the DOM
            vis.finalize();
        }

        const {
            isDestroying,
            isDestroyed
        } = getProperties(this, 'isDestroying', 'isDestroyed');

        if (!isDestroyed || isDestroying) {
            set(this, 'vis', null);
        }
    },

    /**
     * Data is expected to be an object containing name/dataset pairs.
     *
     * In case the data is actually an array, convert it to an object.
     *
     * @method _normalizeData
     * @private
     * @param {Object|Array} data Datasets used for rendering the Vega.View instance
     * @return {Object}
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
     * Where `value is a changeset instance, the changeset will be set on the Vega.View instance via the `change` method.
     *
     * Where `value` is a function, the Vega.View instance, current dataset "live" array, and a changeset instance will be
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
     * {{vega-vis spec=spec data=data}}
     * ```
     *
     * @method updateData
     * @param {Vega.View} vis
     * @param {String} name name of dataset
     * @param {Function|Array|Object} value A function that accepts a changeset, an array of values, or a changeset instance.
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
     *
     * @method willDestroyElement
     */
    willDestroyElement() {
        this._super(...arguments);

        // Clear without scheduling because scheduling introduces a race condition where a two-way-bound property gets nulled
        // on a "parent" component/controller that has been destroyed. Without scheduling, the two-way-bound property changes without
        // trying to set on a destroyed component/controller.
        this.clearVis();
    },

    /**
     * Invoke visualization `run` method to render the visualization.
     * Will only `run` when component hasn't been destroyed or in the process of being destroyed.
     *
     * @method visRun
     * @param {Vega.View} vis Vega.View instance
     * @param {String|undefined} encode
     */
    visRun(vis, encode) {
        const {
            isDestroyed,
            isDestroying
        } = getProperties(this, 'isDestroyed', 'isDestroying');

        if (vis && (!isDestroyed || !isDestroying)) {
            vis.run(encode);
        }
    },

    /**
     * Abstract method to help add/remove events/signals to the visulzation.
     *
     * @method _invokeEventMethod
     * @private
     * @param {Vega.View} vis Vega.View instance
     * @param {String} method Name of method, such as addEventListener or removeSignalListener
     * @param {Object} events KV pairs of event/signal names and functions
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
     *
     * @method addEvents
     * @param {Vega.View} vis Vega.View instance
     * @param {Object} events KV pairs of event names and functions. https://github.com/vega/vega-view#view_addEventListener
     */
    addEvents(vis, events = {}) {
        this._invokeEventMethod(vis, 'addEventListener', events);
    },

    /**
     * Removes event listeners contained in an `events` object.
     *
     * @method removeEvents
     * @param {Vega.View} vis Vega.View instance
     * @param {Object} events KV pairs of event names and functions. https://github.com/vega/vega-view#view_removeEventListener
     */
    removeEvents(vis, events = {}) {
        this._invokeEventMethod(vis, 'removeEventListener', events);
    },

    /**
     * Adds signal event listeners contained in a `signalevents` object.
     *
     * @method addSignalEvents
     * @param {Vega.View} vis Vega.View instance
     * @param {Object} signalEvents KV pairs of signal evnet names and functions. https://github.com/vega/vega-view#view_addSignalListener
     */
    addSignalEvents(vis, signalEvents = {}) {
        this._invokeEventMethod(vis, 'addSignalListener', signalEvents);
    },

    /**
     * Removes signal event listeners contained in a `signalevents` object.
     *
     * @method removeSignalEvents
     * @param {Vega.View} vis Vega.View instance
     * @param {Object} signalEvents KV pairs of signal evnet names and functions. https://github.com/vega/vega-view#view_addSignalListener
     */
    removeSignalEvents(vis, signalEvents = {}) {
        this._invokeEventMethod(vis, 'removeSignalListener', signalEvents);
    }
});
