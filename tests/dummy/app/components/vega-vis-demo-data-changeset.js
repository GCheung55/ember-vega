import VegaVisDemoBase from './vega-vis-demo-base';
import layout from '../templates/components/vega-vis-demo-data-changeset';
import { computed, get, set } from '@ember/object';
import { A as emberArray } from '@ember/array';
import { changeset } from 'vega';

export default VegaVisDemoBase.extend({
    layout,

    // BEGIN-SNIPPET vega-vis-data-changeset.js
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

    data: computed(function() {
        return {
            table: changeset().insert([
                {"category": "A", "amount": 28},
                {"category": "B", "amount": 55},
                {"category": "C", "amount": 43},
                {"category": "D", "amount": 91},
                {"category": "E", "amount": 81},
                {"category": "F", "amount": 53},
                {"category": "G", "amount": 19},
                {"category": "H", "amount": 87}
            ])
        };
    }),
    // END-SNIPPET

    // BEGIN-SNIPPET vega-vis-data-changeset-actions.js
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

            set(this, 'data', {
                table: changeset().insert(dataSource.map((datum) => ({...datum})))
            });
        },

        remove() {
            const dataSource = get(this, 'dataSource');
            const lastObject = get(dataSource, 'lastObject');

            if (lastObject) {
                dataSource.removeObject(lastObject);

                set(this, 'data', {
                    table: changeset().remove((datum) => {
                        return datum.category === lastObject.category;
                    })
                });
            }
        },

        change() {
            const table = get(this, 'dataSource');
            const lastObject = get(table, 'lastObject');

            if (lastObject) {
                const amount = Math.round(Math.random() * 100);
                set(lastObject, 'amount', amount);

                set(this, 'data', {
                    table: changeset().modify((datum) => {
                        return datum.category === lastObject.category
                    }, 'amount', amount)
                });
            }
        }
    }
    // END-SNIPPET
});
