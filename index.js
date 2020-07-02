//import Web3 from 'web3';
const Web3 = require('web3');
const utils = require('util');
const wait = utils.promisify(setTimeout);
const config = require('./config');
const healthChecks = require('./healthChecks');
const fiveMinutes = 1000 * 60 * 5;
let lastRestart;

if(!config) {
  console.error("Please provide a config.js. See config.example.js for an example");
  process.exit(1);
}

async function main() {
  while(true) {
    try {
      await Promise.all(healthChecks.map(check => check(config)));
    } catch(e) {
      if(config.restartOnIssue) {
        console.error(e);
        console.log("Issue detected, restarting parity");
      }
    }
    console.log("Healthchecks will resume in 5 minutes");
    await wait(fiveMinutes);
  }
}

main();
