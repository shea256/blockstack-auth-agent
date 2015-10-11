'use strict'

var PrivateKeychain = require('keychain-manager').PrivateKeychain

function BlockchainAuthAgent(privateKeychain, document) {
    if (!(privateKeychain instanceof PrivateKeychain)) {
        throw Error('privateKeychain must be a PrivateKeychain object')
    }
    this.privateKeychain = privateKeychain
    this.document = document
    this.loginForm = this.getLoginFormFromPage()
    this.loginErrorTimeout = 2000
    this.loginErrorCallback = function(error) {
        console.log(error)
    }
}

BlockchainAuthAgent.prototype.elementSelectors = {
    authRequestInput: 'input[name="request"]',
    authResponseInput: 'input[name="response"]',
    submitButton: 'input[type="submit"], button, input[type="image"]'
}

function getElementParent(currentElement, nodeName) {
    while (currentElement !== null) {
        currentElement = currentElement.parentElement
        if (currentElement.nodeName === nodeName.toUpperCase()) {
            break
        }
    }
    return currentElement
}

BlockchainAuthAgent.prototype.getLoginFormFromPage = function() {
    var loginForm = null

    var authRequestField = this.document.querySelector(this.elementSelectors.authRequestInput)
    
    if (!authRequestField) {
        return null
    }

    var loginFormElement = getElementParent(authRequestField, 'form'),
        authResponseField = loginFormElement.querySelector(this.elementSelectors.authResponseInput),
        submitButton = loginFormElement.querySelector(this.elementSelectors.submitButton)
    
    if (loginFormElement && authRequestField && authResponseField) {
        loginForm = {
            container: loginFormElement,
            authRequestField: authRequestField,
            authResponseField: authResponseField,
            submitButton: submitButton
        }
    }

    return loginForm
}

BlockchainAuthAgent.prototype.loginOptionPresent = function() {
    if (this.loginForm && this.loginForm !== null) {
        return true
    } else {
        return false
    }
}

BlockchainAuthAgent.prototype.getCurrentDomain = function() {
    return window.location.host
}

BlockchainAuthAgent.prototype.setLoginErrorTimeout = function() {
  /* Trigger the form's submit function */
  var _this = this
  setTimeout(function() {
    var error = 'login failed'
    _this.loginErrorCallback(error)
  }, _this.loginErrorTimeout)
}

BlockchainAuthAgent.prototype.submitLoginForm = function() {
  /* Submit the login form on the page. */
  if (this.loginForm.submitButton) {
    /* Click the submit button */
    this.loginForm.submitButton.click()
  } else {
    /* Trigger the form's submit function */
    this.loginForm.container.submit()
  }
  this.setLoginErrorTimeout()
}

BlockchainAuthAgent.prototype.createAuthResponseToken = function() {
    var authRequestToken = this.loginForm.authRequestField.value,
        authRequestPayload = decodeToken(authRequestToken).payload

    var challenge = authRequestPayload.challenge,
        appKeyName = authRequestPayload.issuer.blockchainid,
        chainPath = this.privateKeychain.secretHash(appKeyName),
        privateKeyHex = this.privateKeychain.descendant(chainPath).privateKey().toString()

    var authResponse = new AuthResponse(privateKeyHex)
    
    authResponse.prepare(challenge)

    var authResponseToken = authResponse.sign()

    return authResponseToken
}

BlockchainAuthAgent.prototype.initiateLogin = function() {
    this.loginForm.authResponseField.value = this.createAuthResponseToken()
    this.submitLoginForm()
}

module.exports = BlockchainAuthAgent
