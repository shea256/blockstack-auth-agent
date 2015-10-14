# Blockchain Auth Agent

Agent for logging into websites with Blockchain Auth.

### Getting Started

This library is intended for use in the browser.

First, install the library via npm, then browserify your bundle and include that bundle in your web application.

```
npm install blockchain-auth-agent
```

### Logging In

```js
var BlockchainAuthAgent = require('blockchain-auth-agent'),
    PrivateKeychain = require('keychain-manager').PrivateKeychain

var privateKeychain = new PrivateKeychain()
var blockchainAuthAgent = new BlockchainAuthAgent(privateKeychain, document);
if (blockchainAuthAgent.loginOptionPresent()) {
    blockchainAuthAgent.initiateLogin();
}
```
