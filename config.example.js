module.exports = {
  restartOnIssue: true,
  restartCommand: "service parity restart && service stunnel4 restart",
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
