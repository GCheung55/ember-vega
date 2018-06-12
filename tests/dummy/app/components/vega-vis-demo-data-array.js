import VegaVisDemoBase from './vega-vis-demo-base';
import layout from '../templates/components/vega-vis-demo-data-array';
import { computed, get, set } from '@ember/object';
import { A as emberArray } from '@ember/array';

export default VegaVisDemoBase.extend({
    layout,

    // BEGIN-SNIPPET vega-vis-data-array.js
    dataSource: computed(function() {
        return emberArray([
            {"category": "A", "amount": 28},
            {"category": "B", "amount": 55},
            {"category": "C", "amount": 43},
            {"category": "D", "amount": 91},
            {"category": "E", "amount": 81},
            {"category": "F", "amount": 53},
            {"category": "G", "amount": 19},
            {"category": "H", "amount": 87}
        ]);
    }),

    data: computed('dataSource.{[],@each.amount}', function () {
        const dataSource = get(this, 'dataSource');
        return {
            table: dataSource.map((datum) => {
                // return a copy because Vega Vis will mutate the dataset.
                return {
                    ...datum
                };
            })
        };
    }),
    // END-SNIPPET

    // BEGIN-SNIPPET vega-vis-data-array-actions.js
    actions: {
        add() {
            const dataSource = get(this, 'dataSource');
            const lastObject = get(dataSource, 'lastObject');

            let obj = {
                category: 'A',
                amount: Math.round(Math.random() * 100)
            };

            if (lastObject) {
                const lastCategory = lastObject.category;
                const category = lastCategory.substring(0, lastCategory.length - 1) + String.fromCharCode(lastCategory.charCodeAt(lastCategory.length - 1) + 1);
                obj.category = category;
            }

            dataSource.pushObject(obj);
        },

        remove() {
            const dataSource = get(this, 'dataSource');
            const lastObject = get(dataSource, 'lastObject');

            if (lastObject) {
                dataSource.removeObject(lastObject);
            }
        },

        change() {
            const table = get(this, 'dataSource');
            const lastObject = get(table, 'lastObject');

            if (lastObject) {
                const amount = Math.round(Math.random() * 100);
                set(lastObject, 'amount', amount);
            }
        }
    }
    // END-SNIPPET
});
