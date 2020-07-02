//import Web3 from 'web3';
const Web3 = require('web3');
const utils = require('util');
const wait = utils.promisify(setTimeout);
const config = require('./config');
const fiveMinutes = 1000 * 60 * 5;
let lastRestart;

if(!config) {
  console.error("Please provide a config.js. See config.example.js for an example");
  process.exit(1);
}

async function checkWsHealth() {
  const wsUrl = `${config.wsProtocol}://${config.host}:${config.wsPort}`;
  const web3 = new Web3(new Web3.providers.WebsocketProvider(wsUrl));
  let timeStarted = Date.now();
  let connectAttempts = 0;
  while(!web3.currentProvider.connected) {
    console.log("Connecting to", wsUrl);
    connectAttempts++;
    await wait(1000);
    if(connectAttempts > 10) {
      console.error("Failed to connect to", wsUrl);
    }
  }
  console.log("Connected");

  const blockSubscription = await web3.eth.subscribe('newBlockHeaders');
  let lastBlock;
  let lastSawTime = Date.now();
  blockSubscription.subscribe((err, block) => {
    lastBlock = block;
    lastSawTime = Date.now();
  });

  while(Date.now() < lastSawTime + fiveMinutes) {
    if(!lastBlock) {
      console.log("Waiting for a block");
    } else {
      console.log("Last received block", lastBlock.number);
    }
    await wait(8000);
  }
  throw new Error("No blocks over websocket subscription in the past 5 minutes");
}

async function main() {
  while(true) {
    let healthChecks = [];
    if(config.wsPort && config.detect.websocketsStuck) {
      healthChecks.push(checkWsHealth());
    }

    try {
      await Promise.all(healthChecks);
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
