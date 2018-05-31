import Component from '@ember/component';
import { computed, get, set } from '@ember/object'
import { scheduleOnce } from '@ember/runloop';
import { getOwner } from '@ember/application';
import layout from '../templates/components/vega-vis-container-dimensions';

export default Component.extend({
    layout,

    classNames: [ 'vega-vis-container-dimensions' ],

    /**
     * Dimensions of the component - return value of element.getBoundingClientRect().
     *
     * The dimensions can be used to pass the width and height of a vega-vis component.
     *
     * It's useful with aspect ratios.
     *
     * @returns {ClientRect}
     */
    dimensions: computed(function() {
        return this.computeComponentDimensions();
    }),

    /**
     * Determines if the component is being rendered in Fastboot
     * @returns {object|undefined}
     */
    fastboot: computed(function() {
        return getOwner(this).lookup('service:fastboot');
    }),

    /**
     * Get the return value of element.getBoundingClientRect().
     * @returns {ClientRect}
     */
    computeComponentDimensions() {
        return this.element.getBoundingClientRect();
    },

    /**
     * set the return value of element.getBoundingClientRect() as `dimensions` property.
     */
    recomputeComponentDimensions() {
        if (!this.isDestroyed || !this.isDestroying) {
            set(this, 'dimensions', this.computeComponentDimensions());
        }
    },

    /**
     * Store and set the window resize event listener.
     *
     * Recompute the dimensions.
     * @override
     */
    didInsertElement() {
        this._super(...arguments);

        if (!get(this, 'fastboot')) {
            const _windowResize = () => {
                scheduleOnce('afterRender', this, 'recomputeComponentDimensions');
            };

            set(this, '_windowResize', _windowResize);

            window.addEventListener('resize', _windowResize);

            scheduleOnce('afterRender', this, 'recomputeComponentDimensions');
        }
    },

    /**
     * Remove the window resize event listener.
     *
     * @override
     * @returns {*}
     */
    willDestroyElement() {
        this._super(...arguments);

        if (!get(this, 'fastboot')) {
            window.removeEventListener('resize', get(this, '_windowResize'));
        }
    }
});
