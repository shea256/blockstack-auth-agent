'use strict'

var test = require('tape'),
    PrivateKeychain = require('keychain-manager').PrivateKeychain,
    BlockchainAuthAgent = require('./index')

var privateKeychain = new PrivateKeychain()

function Document() {
    this.querySelector = function() {}
}

test('BlockchainAuthAgent', function(t) {
    t.plan(1)

    var blockchainAuthAgent = new BlockchainAuthAgent(privateKeychain, new Document())
    t.ok(blockchainAuthAgent, 'blockchain auth agent should have been created')
})
