import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clearRender, render, triggerEvent, settled, find } from '@ember/test-helpers';
import { get, set } from '@ember/object';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | vega-vis-container', function (hooks) {
    setupRenderingTest(hooks);

    test('rendering component attaches resize event listener', async function(assert) {
        const spy = sinon.spy(window, 'addEventListener');

        await render(hbs`{{#vega-vis-container _windowResize=_windowResize as |dimensions|}}{{/vega-vis-container}}`);

        const _windowResize = get(this, '_windowResize');

        assert.ok(spy.calledTwice, 'expected addEventListner to be called twice');
        assert.ok(spy.calledWith('resize', _windowResize), 'expected addEventListener to be called with resize event and handler');
        assert.ok(spy.calledWith('orientationchange', _windowResize), 'expected addEventListener to be called with orientationchange event and handler');
    });

    test('destroying component removes resize event listener', async function(assert) {
        const spy = sinon.spy(window, 'removeEventListener');

        await render(hbs`{{#vega-vis-container _windowResize=_windowResize as |dimensions|}}{{/vega-vis-container}}`);

        const _windowResize = get(this, '_windowResize');

        await clearRender();

        assert.ok(spy.calledTwice, 'expected removeEventListner to be called twice');
        assert.ok(spy.calledWith('resize', _windowResize), 'expected removeEventListner to be called with resize event and handler');
        assert.ok(spy.calledWith('orientationchange', _windowResize), 'expected removeEventListner to be called with orientationchange event and handler');
    });

    test('window resize event sets dimensions attr', async function(assert) {
        set(this, 'dummyDimensions', null);

        await render(hbs`{{#vega-vis-container dimensions=dummyDimensions as |dimensions|}}{{/vega-vis-container}}`);


        // Set dummyDimensions to null to know that it changed when window resize event is triggered
        run(() => {
            set(this, 'dummyDimensions', null);
        });

        await settled();

        let dummyDimensions = get(this, 'dummyDimensions');

        assert.equal(dummyDimensions, null, 'Expected dimensions to start off null, when passed null attr');

        await triggerEvent(window, 'resize');

        dummyDimensions = get(this, 'dummyDimensions');

        assert.ok(dummyDimensions, 'Expected dimensions to change when window resize event is triggered');
    });

    test('yielded object has dimensions property that contains height', async function(assert) {
        await render(hbs`
            {{#vega-vis-container as |ui|}}
                {{ui.dimensions.height}}
            {{/vega-vis-container}}
        `);

        assert.equal(this.element.textContent.trim(), this.element.getBoundingClientRect().height, 'Expected ui.dimensions.height to match');
    });

    test('yielded object has dimensions property that contains width', async function(assert) {
        await render(hbs`
            {{#vega-vis-container as |ui|}}
                {{ui.dimensions.width}}
            {{/vega-vis-container}}
        `);

        assert.equal(this.element.textContent.trim(), this.element.getBoundingClientRect().width, 'Expected ui.dimensions.width to match');
    });

    test('yielded object has element property that is the component\'s element', async function(assert) {
        await render(hbs`
            {{#vega-vis-container as |ui|}}
                {{ui.element.id}}
            {{/vega-vis-container}}
        `);

        assert.equal(this.element.textContent.trim(), this.element.firstElementChild.id, 'Expected ui.element to match ID attributes');
    });

    test('yielded object has vis property that is a composed vega-vis component', async function(assert) {
        set(this, 'spec', {});

        await render(hbs`
            {{#vega-vis-container as |ui|}}
                {{ui.vis spec=spec}}
            {{/vega-vis-container}}
        `);

        assert.ok(find('svg'), 'Expected ui.vis to render');
    });
});
