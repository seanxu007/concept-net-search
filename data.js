const axios = require('axios');

const Data = class {
    constructor(maxDeep, weightLimit) {
        this.baseUrl = 'http://api.conceptnet.io';
        // object cached isa relation parent child pairs
        this.isaRelation = {};
        // throttle the request to conceptNet
        this.maxDeep = maxDeep;
        this.weightLimit = weightLimit;

    }

    // check if key is existing in current isaRelation object
    has(term) {
        return this.isaRelation[term] !== undefined;
    }

    // add parent child pair into isaRelation object
    // TODO: add check to prevent children's children is parent loop (need to modify structure and add deeps)
    add(parent, child, weight) {
        parent = parent.trim().toLowerCase().replace(' ', '_');
        child = child.trim().toLowerCase().replace(' ', '_');
        const data = {'term': child, 'weight': weight};
        if (!this.has(parent)) {
            this.isaRelation[parent] = [];
        }
        if (parent !== child) {
            this.isaRelation[parent].push(data);
        }
    }

    // get term from existing isaRelation object (default ordered by weight desc)
    get(term) {
        return this.has(term) ? this.isaRelation[term] : [];
    }

    // init termList and add related isa concept into isaRelation parameter
    init(term) {
        return axios.get(this.baseUrl + '/query?rel=/r/IsA&limit=100&start=/c/en/' + term)
            .then(result => {
                this.termList = result.data['edges'].map(edge => edge['end']['label'].trim().toLowerCase().replace(' ', '_'));
                this.termList.push(term);
                const p = [];
                result.data['edges'].forEach((edge, index) => {
                    p.push(this.setIsaRelation(edge['end']['label'].trim().toLowerCase().replace(' ', '_'), 0));
                });
                return Promise.all(p);
            })
            .catch(err => console.log(err));
    }

    // set isaRelation object by parent child pair
    setIsaRelation(term, deep) {
        deep++
        if (deep > this.maxDeep) {
            return;
        }
        return axios.get(this.baseUrl + '/query?rel=/r/IsA&limit=100&end=/c/en/' + term)
            .then(result => {
                const p = [];
                result.data['edges'].forEach((edge, index) => {
                    // ignore low weight concepts using weightLimit paramater
                    if (edge['weight'] < this.weightLimit) {
                        return;
                    }
                    this.add(edge['end']['label'], edge['start']['label'], edge['weight']);
                    p.push(this.setIsaRelation(edge['start']['label'].trim().toLowerCase().replace(' ', '_'), deep));
                });

                return Promise.all(p);
            });
    }

    search(term) {
        return this.init(term).then(result => {
            return this.parseOutput();
        });
    }

    // parse the response to hierachical JSON structure
    parseOutput() {
        // order the term list by their deeps, the terms with most general concept goes into the front
        let orderedTermList = this.termList.sort((a, b) => {
            return this.get(b).filter(value => this.termList.includes(value['term'])).length
                - this.get(a).filter(value => this.termList.includes(value['term'])).length
        });

        // generate the result using data's termList
        const result = {};
        orderedTermList.forEach(term => {
            result[term] = this.getTermValue(term);
        });
        return result;
    }

    // recurise function to create hierachical JSON structure
    getTermValue(term) {
        const result = {};
        this.get(term).filter(value => this.termList.includes(value['term'])).forEach(isaItem => {
            result[isaItem['term']] = this.getTermValue(isaItem['term']);
        });
        return result;
    }
}

module.exports = Data;
