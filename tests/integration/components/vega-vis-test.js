import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupSinonSandbox } from 'ember-sinon-sandbox/test-support';
import { clearRender, render, find, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { get, set } from '@ember/object';
import { run } from '@ember/runloop';
import vega, { changeset } from 'vega';

function basicAttrTest(attr, value, template, method = attr) {
    test('expected to be set on the vega instance', async function(assert) {
        const spy = this.sandbox.spy(vega.View.prototype, method);

        run(() => {
            set(this, attr, value);
        });

        await render(template);

        assert.ok(spy.calledWith(value), `Expected view.${method} to be executed with ${JSON.stringify(value)} param`);
    });
}

function basicChangeAttrTest(attr, oldValue, newValue, template, method = attr) {
    test('change expected to update the vega instance', async function(assert) {
        const spy = this.sandbox.spy(vega.View.prototype, method);

        run(() => {
            set(this, attr, oldValue);
        });

        await render(template);

        assert.ok(spy.calledWith(oldValue), `Expected view.${method} to be executed with ${JSON.stringify(oldValue)} param`);

        run(() => {
            set(this, attr, newValue);
        });

        await settled();

        assert.ok(spy.calledWith(newValue), `Expected view.${method} to be executed with ${JSON.stringify(newValue)} param`);
    });
}

function basicEventTypeAttrTest(attr, value, template, method = attr) {
    test('expected to be set on the vega instance', async function(assert) {
        const spy = this.sandbox.spy(vega.View.prototype, method);
        const keys = Object.keys(value);

        run(() => {
            set(this, attr, value);
        });

        await render(template);

        keys.forEach((key) => {
            assert.ok(spy.calledWith(key, value[key]), `Expected view.${method} invoked with event ${key} and respective handler`);
        });
    });
}

function basicEventTypeChangeAttrTest(attr, oldValue, newValue, template, addMethod, removeMethod) {
    test('change expected to update the vega instance', async function(assert) {
        const addSpy = this.sandbox.spy(vega.View.prototype, addMethod);
        const removeSpy = this.sandbox.spy(vega.View.prototype, removeMethod);
        const oldKeys = Object.keys(oldValue);
        const newKeys = Object.keys(newValue);

        run(() => {
            set(this, attr, oldValue);
        });

        await render(template);

        oldKeys.forEach((key) => {
            assert.ok(addSpy.calledWith(key, oldValue[key]), `Expected view.${addMethod} invoked with event ${key} and respective handler`);
        });

        run(() => {
            set(this, attr, newValue);
        });

        await settled();

        oldKeys.forEach((key) => {
            assert.ok(removeSpy.calledWith(key, oldValue[key]), `Expected view.${removeMethod} invoked with event ${key} and respective handler`);
        });

        newKeys.forEach((key) => {
            assert.ok(addSpy.calledWith(key, newValue[key]), `Expected view.${addMethod} invoked with new event ${key} and handler`);
        });
    });
}

module('Integration | Component | vega vis', function(hooks) {
    setupRenderingTest(hooks);
    setupSinonSandbox(hooks);

    set(this, 'spec', {});

    test('it renders', async function(assert) {
        await render(hbs`{{vega-vis spec=spec}}`);

        assert.equal(find('svg').textContent.trim(), '');
    });

    test('destroying nulls vis attr', async function(assert) {
        await render(hbs`{{vega-vis vis=vis spec=spec}}`);

        assert.ok(get(this, 'vis'), 'Expected vis attr to be set');

        await clearRender();

        assert.notOk(get(this, 'vis'), 'Expected vis attr to be null');
    });

    test('config attr', async function(assert) {
        const parseSpy = this.sandbox.spy(vega, 'parse');
        const config = {};
        set(this, 'config', config);

        await render(hbs`{{vega-vis config=config spec=spec}}`);

        assert.ok(parseSpy.calledOnceWith(config), '`parse` expected to be executed once with `config`');
    });

    module('height attr', function() {
        const template = hbs`{{vega-vis spec=spec height=height}}`;

        basicAttrTest('height', 100, template);
        basicChangeAttrTest('height', 100, 1, template);
    });

    module('width attr', function() {
        const template = hbs`{{vega-vis spec=spec width=width}}`;

        basicAttrTest('width', 100, template);
        basicChangeAttrTest('width', 100, 1, template);
    });

    module('padding attr', function() {
        const template = hbs`{{vega-vis spec=spec padding=padding}}`;

        basicAttrTest('padding', {top: 0, bottom: 0, left: 0, right: 0}, template);
        basicChangeAttrTest('padding', {top: 0, bottom: 0, left: 0, right: 0}, {top: 1, bottom: 1, left: 1, right: 1}, template);
    });

    module('background attr', function() {
        const template = hbs`{{vega-vis spec=spec background=background}}`;

        basicAttrTest('background', '#000', template);
        basicChangeAttrTest('background', '#001', '#000', template);
    });

    module('spec attr', function() {
        // test('throws when not passed to the component', async function(assert) {
        //     assert.rejects(render(hbs`{{vega-vis}}`), 'Expected to throw when `spec` is not passed to the component');
        // });
        test('expected to be set on the vega instance', async function(assert) {
            const parseSpy = this.sandbox.spy(vega, 'parse');
            const spec = {};
            run(() => {
                set(this, 'spec', spec);
            });

            await render(hbs`{{vega-vis spec=spec}}`);

            assert.ok(parseSpy.calledOnceWith(spec), '`parse` expected to be executed once with `spec`');
        });

        test('change expected to update the vega instance', async function(assert) {
            const parseSpy = this.sandbox.spy(vega, 'parse');
            const oldSpec = {width: 1};
            const spec = {width: 2};
            let vis;
            run(() => {
                set(this, 'spec', oldSpec);
            });

            await render(hbs`{{vega-vis vis=vis spec=spec}}`);
            vis = get(this, 'vis');

            assert.ok(parseSpy.calledWith(oldSpec), '`parse` expected to be executed once with oldSpec');

            run(() => {
                set(this, 'spec', spec);
            });

            await settled();

            assert.ok(parseSpy.calledWith(spec), '`parse` expected to be executed once with spec');
            assert.notEqual(vis, get(this, 'vis'), 'Expected a new vega instance to be created');
        });
    });


    module('enableHover attr', function() {
        test('by default expected to trigger vega instance hover method', async function(assert) {
            const spy = this.sandbox.spy(vega.View.prototype, 'hover');

            await render(hbs`{{vega-vis spec=spec}}`);

            assert.ok(spy.calledOnce, 'Expected view.hover to be called once');
        });

        test('when false expected to not trigger vega instance hover method', async function(assert) {
            const spy = this.sandbox.spy(vega.View.prototype, 'hover');

            await render(hbs`{{vega-vis spec=spec enableHover=false}}`);

            assert.ok(spy.notCalled, 'Expected view.hover to not be called');
        });
    });

    module('rendererType attr', function() {
        const template = hbs`{{vega-vis spec=spec rendererType=rendererType}}`;

        basicAttrTest('rendererType', 'svg', template, 'renderer');
        basicChangeAttrTest('rendererType', 'svg', 'canvas', template, 'renderer');
    });

    module('logLevel attr', function() {
        const template = hbs`{{vega-vis spec=spec logLevel=logLevel}}`;

        basicAttrTest('logLevel', 'None', template);
        basicChangeAttrTest('logLevel', 'Warn', 'None', template);
    });

    module('events attr', function() {
        const template = hbs`{{vega-vis spec=spec events=events}}`;

        basicEventTypeAttrTest('events', {
            foo() {}
        }, template, 'addEventListener');

        basicEventTypeChangeAttrTest('events', {
            foo() {}
        }, {
            baz() {}
        }, template, 'addEventListener', 'removeEventListener');
    });

    module('signalEvents attr', function() {
        const template = hbs`{{vega-vis spec=spec signalEvents=signalEvents}}`;

        // Signals are required for signal events, otherwise a parse error will be thrown
        run(() => {
            set(this, 'spec', {
                signals: [
                    { name: 'foo', value: 0 },
                    { name: 'baz', value: 0 }
                ]
            });
        });

        basicEventTypeAttrTest('signalEvents', {
            foo() {}
        }, template, 'addSignalListener');

        basicEventTypeChangeAttrTest('signalEvents', {
            foo() {}
        }, {
            baz() {}
        }, template, 'addSignalListener', 'removeSignalListener');
    });

    module('data attr', function() {
        test('expected to be set on the vega instance', async function(assert) {
            const spy = this.sandbox.spy();
            const changeSpy = this.sandbox.spy(vega.View.prototype, 'change');
            const data = {
                foo: [1],
                bar: spy,
                baz: changeset().insert([2])
            };
            const matchChangeset = this.sandbox.match.has('constructor', changeset);
            let vis;

            run(() => {
                set(this, 'spec', {
                    data: [
                        { name: 'foo' },
                        { name: 'bar' },
                        { name: 'baz' }
                    ]
                });

                set(this, 'data', data);
            });



            await render(hbs`{{vega-vis vis=vis spec=spec data=data}}`);

            vis = get(this, 'vis');

            assert.equal(vis.data('foo')[0].data, 1, 'Expected array data to be found in vega instance');
            assert.equal(vis.data('baz')[0].data, 2, 'Expected data from vega changeset to be found in vega instance');
            assert.ok(changeSpy.calledWithExactly('foo', matchChangeset), 'Expected view.change to be invoked with foo and changeset');
            assert.ok(changeSpy.calledWithExactly('baz', data.baz), 'Expected view.change to be invoked with baz and respective changeset ');
            assert.ok(spy.calledOnceWith(vis, null), 'Expected data.bar function to be invoked with vega instance and value from view.data("bar"), which is expected to be null since there is no data');
        });

        test('change expected to update the vega instance', async function(assert) {
            set(this, 'spec', {
                data: [
                    { name: 'foo', values: [1] },
                    { name: 'bar', values: [2] },
                    { name: 'baz', values: [3] }
                ]
            });
            let vis;

            await render(hbs`{{vega-vis vis=vis spec=spec data=data}}`);

            vis = get(this, 'vis');

            let fooData = vis.data('foo');
            let barData = vis.data('bar');
            let bazData = vis.data('baz');

            assert.equal(fooData.length, 1, 'Expected foo data to contain one item');
            assert.equal(fooData[0].data, 1, 'Expected foo data to match');
            assert.equal(barData.length, 1, 'Expected bar data to contain one item');
            assert.equal(barData[0].data, 2, 'Expected bar data to match');
            assert.equal(bazData.length, 1, 'Expected baz data to contain one item');
            assert.equal(bazData[0].data, 3, 'Expected baz data to match');

            run(() => {
                set(this, 'data', {
                    foo: [4],
                    bar(vis, data, change) {
                        vis.change('bar', change.remove(data));
                    },
                    baz: changeset().insert([5])
                });
            });

            await settled();

            // Updated/replaced data.
            fooData = vis.data('foo');
            barData = vis.data('bar');
            bazData = vis.data('baz');

            assert.equal(fooData.length, 1, 'Expected changed foo data to contain one item');
            assert.equal(fooData[0].data, 4);
            assert.equal(barData.length, 0, 'Expected changed bar data to contain zero items');
            assert.equal(bazData[0].data, 3, 'Expected first item in baz data to match');
            assert.equal(bazData[1].data, 5, 'Expected second item in baz data to match');
            assert.equal(bazData.length, 2, 'Expected changed baz data to contain two items');
        });
    });

    module('onNewVis method callback attr', function() {
        test('expected to be executed when a new vega instance is created', async function(assert) {
            const spy = this.sandbox.spy();
            let vis;
            set(this, 'onNewVis', spy);

            await render(hbs`{{vega-vis vis=vis spec=spec onNewVis=onNewVis}}`);

            vis = get(this, 'vis');

            assert.ok(spy.calledOnceWith(vis), 'Expected onNewVis callback to be executed with new vega instance');
        });
    });

    module('onParseError method attr', function() {
        test('expected to be executed when there is a parse error during vega instance creation', async function(assert) {
            const spy = this.sandbox.spy();

            set(this, 'onParseError', spy);

            await render(hbs`{{vega-vis spec=spec signalEvents=(hash foo=false) onParseError=onParseError}}`);

            assert.ok(spy.calledOnceWith(this.sandbox.match.instanceOf(Error)), 'Expected onParseError callback to be executed with error object');
        });
    });

    // test('updateData method', async function(assert) {});
    // test('visRun method', async function(assert) {});
    // test('_invokeEventMethod method', async function(assert) {});
    // test('addEvents method', async function(assert) {});
    // test('removeEvents method', async function(assert) {});
    // test('addSignalEvents method', async function(assert) {});
    // test('removeSignalEvents method', async function(assert) {});
});
