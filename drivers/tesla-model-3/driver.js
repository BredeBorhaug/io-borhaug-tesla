'use strict';

const Homey = require('homey');
const Tesla = require('node-tesla-api')
const _ = require('lodash')

class MyDriver extends Homey.Driver {
  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('Driver for Tesla onInit start.');



    this.log('Driver for Tesla onInit complete.');

  }

  /**
   * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    // Get list of cars from Tesla
    const { response: cars } = await Tesla.vehicles.list({ token: this.homey.app.getToken().accessToken })

    var devices = []

    cars.forEach(item => {
      if (item.vin[3].toLowerCase() == 3) {
        devices.push({
          data: {
            id: item.id,
            vin: item.vin
          },
          name: item.displayName,
          icon: '/icon_' + item.vin[3].toLowerCase() + '.svg',
          store: {
            s_id: item.idS,
            //grant: pairGrant,
            //username: account.username
          }
        })
      }
    })
    

    return devices
  }
}

module.exports = MyDriver;