//import Web3 from 'web3';
const Web3 = require('web3');
const fiveMinutes = 1000 * 60 * 5;
const utils = require('util');
const wait = utils.promisify(setTimeout);

async function checkForStuckTip(config) {
  if(!config.httpPort || !config.detect.notSyncing) {
    console.log("Skipping sync status checks");
    return;
  }
  const httpUrl = `http://${config.host}:${config.httpPort}`;
  const web3 = new Web3(new Web3.providers.HttpProvider(httpUrl));
  let timeStarted = Date.now();
  let connectAttempts = 0;
  let tip = await web3.eth.getBlockNumber();
  let lastChanged = Date.now();
  console.log("Monitoring", httpUrl, "for tip progression");
  while(Date.now() < lastChanged + fiveMinutes) {
    let newTip = await web3.eth.getBlockNumber();
    if(newTip > tip) {
      tip = newTip;
      lastChanged = Date.now();
      console.log("Progressed to height", tip);
      // we're progressing
    }
    await wait(8000);
  }
  throw new Error("No sync progress in the past 5 minutes");
}
module.exports = checkForStuckTip;
