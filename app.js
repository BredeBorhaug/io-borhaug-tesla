'use strict';

const Homey = require('homey');
const Tesla = require('node-tesla-api')
const _ = require('lodash')



// These values are an open secret.
// See https://tesla-api.timdorr.com for the latest values.
const clientId = '81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384'
const clientSecret = 'c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3'

// Set the refresh interval for the access token.
const refreshInterval = 60*60*24*7 // 7 days in ms

class MyApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp start to initialized');
    // We may not need this
    this._connected = false

    //this._username = this.homey.settings.get('username')
    //this._password = this.homey.settings.get('password')

    // Authenticate the user 
    await this.authenticate()


    // Refresh token every 7 days
    this.refreshToken()

    // Setup the settings callback
    this.setupSettings()




  }

  async authenticate() {
    this._connected = false
    this._auth = null
    try {
      const token = await Tesla.oauth.token({
        email: this.homey.settings.get('username'),
        password: this.homey.settings.get('password'),
        clientId,
        clientSecret
      })
      this._connected = true
      this._auth = token
      this.log('Authorization completed successfully')

    } catch (error) {
      this.log('The auth login process did not succeed. Change the settings')
    }
  }

  async refreshToken() {
    setInterval( async () => {
      const token = await Tesla.oauth.refresh({
        refreshToken: this._auth.refreshToken,
        clientId: clientId,
        clientSecret: clientSecret
      })
      this._auth = token
    }, refreshInterval) // call at interval according to refreshInterval variable
  }

  async wakeCar ({ id, token, retry = 0, maxRetries = 3 }) {
    if(this._connected==false) return
    if (retry === maxRetries) return
    console.log('In wakeCar algorithm')
    const {
      response: { state } 
    } = await Tesla.vehicles.vehicle({ id, token })
    if (state === 'online') return
    await Tesla.vehicles.wake({ id, token })
    await setTimeout(() => {}, 5000)
    // try again
    await this.wakeCar({ id, token, retry: retry + 1, maxRetries })
  }

  async isOnline({id, token}){  
    const {
      response: { state } 
    } = await Tesla.vehicles.vehicle({ id, token })
    this.log('State in isOnline() function : ' + state)
    if (state === 'online') return state
    if (state === 'asleep') return state
  }

  isConnected() {
    return this.isConnected
  }

  getToken() {
    if (this._connected == false) {
      return false
    } else {
      return this._auth
    }
  }

  async setupSettings() {
    await this.homey.settings.on('set', async (args) => {
      //this.log('Settings updated. Call Authorize to get new token and connect to Tesla again.')
      await this.authenticate()
      //this.log('Status of connection is now: ' + this._connected)
    })
  }

}

module.exports = MyApp;