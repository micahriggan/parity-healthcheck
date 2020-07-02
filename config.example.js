module.exports = {
  restartOnIssue: true,
  host: 'localhost',
  httpPort: 8545,
  wsPort: 8546,
  wsProtocol: "ws",
  detect: {
    notSyncing: true,
    websocketsStuck: true,
    slowApi: true
  }
};
