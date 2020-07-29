//import Web3 from 'web3';
const { exec } = require('child_process');
const Web3 = require('web3');
const utils = require('util');
const asyncExec = utils.promisify(exec);
const wait = utils.promisify(setTimeout);
const config = require('./config');
const healthChecks = require('./healthchecks');
const fiveMinutes = 1000 * 60 * 5;
let lastRestart;

if(!config) {
  console.error("Please provide a config.js. See config.example.js for an example");
  process.exit(1);
}

async function runRestartCommand(command) {
  try {
    await asyncExec(command);
  } catch(e) {
    console.error(e);
  }
}

async function main() {
  while(true) {
    try {
      await Promise.all(healthChecks.map(check => check(config)));
    } catch(e) {
      if(config.restartOnIssue) {
        console.error(e);
        console.log("Issue detected, restarting parity");
        await runRestartCommand(config.restartCommand);
      }
    }
    console.log("Healthchecks will resume in 5 minutes");
    await wait(fiveMinutes);
  }
}

if(require.main === module) {
  main();
}

module.exports = {
  checkHealth: main,
  runRestartCommand: () => runRestartCommand(config.restartCommand)
}
