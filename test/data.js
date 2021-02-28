const expect = require('chai').expect;
const Data = require('../data');

// TODO: mock data instead of fetch real data
describe('Concept net search test', async function() {
    const maxDeep = 3;
    const weightLimit = 1;
    const data = new Data(maxDeep, weightLimit);
    it('Should have results for search supreme court', async function() {
        let isaResult = await data.search('supreme_court');
        expect(Object.keys(isaResult).length).to.be.above(0);
    });
  });