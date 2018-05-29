import Component from '@ember/component';
import { computed, get, set } from '@ember/object'
import { scheduleOnce } from '@ember/runloop';
import { getOwner } from '@ember/application';
import layout from '../templates/components/vega-vis-resize';

export default Component.extend({
    layout,

    classNames: [ 'vega-vis-resize' ],

    dimensions: computed(function() {
        return this.computeComponentDimensions();
    }),

    fastboot: computed(function() {
        return getOwner(this).lookup('service:fastboot');
    }),

    computeComponentDimensions() {
        return this.element.getBoundingClientRect();
    },

    recomputeComponentDimensions() {
        if (!this.isDestroyed || !this.isDestroying) {
            set(this, 'dimensions', this.computeComponentDimensions());
        }
    },

    didInsertElement() {
        this._super(...arguments);

        if (!get(this, 'fastboot')) {
            this._windowResize = () => {
                scheduleOnce('afterRender', this, 'recomputeComponentDimensions');
            };

            window.addEventListener('resize', this._windowResize);
        }
    },

    willDestroyElement() {
        this._super(...arguments);

        if (!get(this, 'fastboot')) {
            window.removeEventListener('resize', this._windowResize);
        }
    }
});
