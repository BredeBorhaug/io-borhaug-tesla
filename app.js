'use strict';

const Homey = require('homey');
const Tesla = require('node-tesla-api')
const _ = require('lodash')



// These values are an open secret.
// See https://tesla-api.timdorr.com for the latest values.
const clientId = '81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384'
const clientSecret = 'c7257eb71a564034f9419ee651c7d0e5f7aa6bfbd18bafb5c5c033b093bb2fa3'


class MyApp extends Homey.App {
  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('MyApp start to initialized');
    // We may not need this

    this._username = this.homey.settings.get('username')
    this._password = this.homey.settings.get('password')

    const token = await Tesla.oauth.token({
      email: this._username,
      password: this._password,
      clientId,
      clientSecret
    })
    this._auth = token

    


  }

  getToken(){
    return this._auth
  }

}

module.exports = MyApp;