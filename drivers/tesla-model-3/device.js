'use strict';

const Homey = require('homey')
const Tesla = require('node-tesla-api')


class MyDevice extends Homey.Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {






    let startAutoConditioning = this.homey.flow.getActionCard('start-auto-conditioning');
    startAutoConditioning.registerRunListener(async (args, state) => {
          
      this.log('Should wake the car here')
        // implement wake car algorithm
      
      const {response: { result, reason }} = await Tesla.vehicles.autoConditioningStart({ id: this.getData().id , token: this.homey.app.getToken().accessToken })
      this.log('The result: ' + result)
      this.log('The reason: ' + reason)

      this.log('Started the auto conditioning')
    });

    let stopAutoConditioning = this.homey.flow.getActionCard('stop-auto-conditioning');
    stopAutoConditioning.registerRunListener(async (args, state) => {
          
      this.log('Should wake the car here')
        // implement wake car algorithm
      
      const {response: { result, reason }} = await Tesla.vehicles.autoConditioningStop({ id: this.getData().id , token: this.homey.app.getToken().accessToken })
      this.log('The result: ' + result)
      this.log('The reason: ' + reason)

      this.log('Stoped the auto conditioning')
    });


    this.log('Tesla Model 3 device has been initialized');
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('MyDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('MyDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('MyDevice has been deleted');
  }

  
}

module.exports = MyDevice;
