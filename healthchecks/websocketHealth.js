//import Web3 from 'web3';
const Web3 = require('web3');
const fiveMinutes = 1000 * 60 * 5;
const utils = require('util');
const wait = utils.promisify(setTimeout);

async function checkWsHealth(config) {
  if(!config.wsPort || !config.detect.websocketsStuck) {
    return;
  }
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
      throw new Error("Connection attempted 10 times, and failed");
    }
  }

  const blockSubscription = await web3.eth.subscribe('newBlockHeaders');
  let lastBlock;
  let lastSawTime = Date.now();
  blockSubscription.subscribe((err, block) => {
    lastBlock = block;
    lastSawTime = Date.now();
  });

  console.log("Monitoring", wsUrl, "for websocket block emits");
  while(Date.now() < lastSawTime + fiveMinutes) {
    if(lastBlock) {
      console.log(new Date(), "WS Received block", lastBlock.number);
    }
    await wait(60 * 1000);
  }
  await web3.currentProvider.disconnect();
  delete web3;
  throw new Error("No blocks over websocket subscription in the past 5 minutes");
}


module.exports = checkWsHealth;
