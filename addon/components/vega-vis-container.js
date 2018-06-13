import Component from '@ember/component';
import { computed, get, set } from '@ember/object'
import { scheduleOnce, debounce, cancel } from '@ember/runloop';
import { getOwner } from '@ember/application';
import layout from '../templates/components/vega-vis-container';

/**
 * A component for accessing the component's dimensions.
 *
 * ```hbs
 * {{#vega-vis-container as |ui|}}
 *     {{vega-vis
 *         height=(div ui.dimensions.width 4.259259259)
 *         width=ui.dimensions.width
 *         spec=spec
 *         data=data
 *     }}
 * {{/vega-vis-container}}
 * ```
 *
 * @class VegaVisContainer
 * @yield {Object} ui
 * @yield {ClientRect} ui.dimensions
 * @yield {Element} ui.element
 * @yield {Ember.Component} ui.vis
 */
export default Component.extend({
    layout,

    classNames: [ 'vega-vis-container' ],

    _resizeTimer: null,

    /**
     * Dimensions of the component - return value of element.getBoundingClientRect().
     *
     * The dimensions can be used to pass the width and height of a vega-vis component.
     *
     * It's useful with aspect ratios.
     *
     * [MDN Docs: Element.getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
     *
     * @computed dimensions
     * @type {ClientRect}
     */
    dimensions: computed(function() {
        return this.computeComponentDimensions();
    }),

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
     * Get the return value of element.getBoundingClientRect().
     *
     * @method computeComponentDimensions
     * @return {ClientRect}
     */
    computeComponentDimensions() {
        return this.element.getBoundingClientRect();
    },

    /**
     * Set the return value of element.getBoundingClientRect() as `dimensions` property.
     *
     * @method recomputeComponentDimensions
     */
    recomputeComponentDimensions() {
        if (!this.isDestroyed || !this.isDestroying) {
            set(this, 'dimensions', this.computeComponentDimensions());
        }
    },

    /**
     * Store and set the window resize event listener and recompute the dimensions.
     *
     * @method didInsertElement
     */
    didInsertElement() {
        this._super(...arguments);

        if (!get(this, 'fastboot')) {

            const _windowResize = () => {
                this.resizeTimer = cancel(this.resizeTimer);

                this.resizeTimer = debounce(this, scheduleOnce, 'afterRender', this, 'recomputeComponentDimensions', 50);
            };

            set(this, '_windowResize', _windowResize);

            window.addEventListener('resize', _windowResize);
            window.addEventListener('orientationchange', _windowResize);

            scheduleOnce('afterRender', this, 'recomputeComponentDimensions');
        }
    },

    /**
     * Remove the window resize event listener.
     *
     * @method willDestroyElement
     */
    willDestroyElement() {
        this._super(...arguments);

        if (!get(this, 'fastboot')) {
            this.resizeTimer = cancel(this.resizeTimer);
            window.removeEventListener('resize', get(this, '_windowResize'));
            window.removeEventListener('orientationchange', get(this, '_windowResize'));
        }
    }
});
