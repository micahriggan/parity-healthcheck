module.exports = {
  restartOnIssue: true,
  restartCommand: "killall parity2.4.2 && killall stunnel4",
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
