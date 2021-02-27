const axios = require('axios');
const waitForUserInput = require('./input')
const Data = require('./data');

async function main () {
    let stopInput = false;
    const maxDeep = 3;
    const weightLimit = 1;
    while (!stopInput) {
        let userInput = await waitForUserInput('What you want to search: ');
        const data = new Data(maxDeep, weightLimit);
        let isaResult = await data.search(userInput.toLowerCase().trim().replace(' ', '_')); 
        console.log('Result:\n');
        console.log(isaResult);
    }  
}

main()