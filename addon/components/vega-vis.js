import Ember from 'ember';
import vg from 'vega';
import layout from '../templates/components/vega-vis';

const {
    get,
    getProperties,
    setProperties,
    computed,
    $,
    run,
    on,
    observer,
    isArray,
    assert
} = Ember;

export default Ember.Component.extend({
    classNames: ['vega-vis'],

    layout,

    rendererType: 'svg',

    logLevel: 'Warn',

    background: undefined,

    padding: undefined,

    fastboot: computed(function() {
        let owner = Ember.getOwner(this);

        return owner.lookup('service:fastboot');
    }),

    didInsertElement() {
        this._setupWindowResize();

        let {
            data,
            spec,
            config,
            rendererType,
            padding,
            background,
            logLevel
        } = getProperties(this, 'data', 'spec', 'rendererType', 'padding', 'background', 'logLevel');

        assert('spec property must be defined', !!spec);

        if (isArray(data)) {
            spec.data = data;
        }

        const runtime = vg.parse(spec, config);
        const vis = new vg.View(runtime);

        // Only initialize if not in fastboot.
        if (!get(this, 'fastboot')) {
            vis.initialize(this.element);
        }

        // TODO: Insert the data instead of setting it on the spec.
        // if (isArray(data)) {
        //     data.forEach((item) => {
        //         const {
        //             name,
        //             values
        //         } = item;
        //         if (name && values) {
        //             vis.insert(name, values);
        //         }
        //     });
        // }

        // Optional.
        padding && vis.padding(padding);
        background && vis.background(background);

        vis.logLevel(vg[logLevel || 'Warn']);
        vis.renderer(rendererType);
        vis.hover();
        vis.run();

        this.set('vis', vis);

        return this._super(...arguments);
    },

    willDestroyElement() {
        this._teardownResize();

        let vis = this.get('vis');

        if (vis) {
            vis.finalize();
            this.set('vis', undefined);
        }

        return this._super(...arguments);
    },

    onWindowResize() {
        const vis = get(this, 'vis');
        if (vis) {
            const element = this.$();
            const width = element.width();
            const height = element.height();

            // TODO: Check subtract height and width from padding before setting?
            vis.width(width).height(height).run();
        }
    },

    _setupWindowResize() {
        if (!get(this, 'fastboot')) {
            this._onWindowResize = () => {
                run.debounce(this, 'onWindowResize', 300);
            };

            $(window).on('resize', this._onWindowResize);
        }
    },

    _teardownWindowResize() {
        if (!get(this, 'fastboot')) {
            $(window).off('resize', this._onWindowResize);
        }
    }
});
