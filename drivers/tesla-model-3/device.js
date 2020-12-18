'use strict';

const Homey = require('homey')
const Tesla = require('node-tesla-api')




const flowlist = {
  autoConditioningStart: 'auto-conditioning-start',
  autoConditioningStop: 'auto-conditioning-stop',
  setConditioningTemp: 'set-conditioning-temp',
  stateOfCharge: 'state-og-charge',
  carIsCharging: 'car-is-charging'
}

class MyDevice extends Homey.Device {
  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {


    // Action flow cards
    await this.autoConditioningStart('auto-conditioning-start') //flowlist.startAutoConditioning)
    await this.autoConditioningStop('auto-conditioning-stop') //flowlist.stopAutoConditioning)
    await this.wakeCarAction('wake-car')


    // Condition flow cards
    await this.stateOfCharge('state-of-charge')
    await this.carIsCharging('car-is-charging')

    //console.log(await Tesla.vehicles.chargeState({ id: this.getData().id, token: this.homey.app.getToken().accessToken }))

    this.log('Tesla Model 3 device has been initialized');
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('MyDevice has been added');
  }

  // Register the auto conditioning start condittion
  async autoConditioningStart(flowId) {

    let startAutoConditioning = this.homey.flow.getActionCard(flowId);
    startAutoConditioning.registerRunListener(async (args, state) => {

      this.log('Check if the car is asleep. If it is, call the wakeCar function')
      if (await this.homey.app.isOnline({ id: this.getData().id, token: this.homey.app.getToken().accessToken }) === 'asleep') {
        this.log('Car is asleep')
        await this.homey.app.wakeCar({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
      }
      try {
        const { response: { batteryLevel, chargeEnableRequest } } = await Tesla.vehicles.chargeState({ id: this.getData().id, token: this.homey.app.getToken().accessToken })

        // TODO - Make into variable from flowcard, and a min value to override user input. For now set to 20%. 
        if (batteryLevel >= 20) {
          const { response: { result, reason } } = await Tesla.vehicles.autoConditioningStart({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
          this.log('Started the auto conditioning')
        }
      } catch (error) {
        this.log(error)
      }
    });
  }


  // Register the auto conditioning stop condittion
  async autoConditioningStop(flowId) {
    let stopAutoConditioning = this.homey.flow.getActionCard(flowId);
    stopAutoConditioning.registerRunListener(async (args, state) => {

      this.log('Check if the car is asleep. If it is, call the wakeCar function')
      if (await this.homey.app.isOnline({ id: this.getData().id, token: this.homey.app.getToken().accessToken }) === 'asleep') {
        this.log('Car is asleep')
        await this.homey.app.wakeCar({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
      }
      try {
        const { response: { result, reason } } = await Tesla.vehicles.autoConditioningStop({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
        this.log('Stoped the auto conditioning')
      } catch (error) {
        this.log(error)
      }
      //this.log('The result: ' + result)
      //this.log('The reason: ' + reason)

    });
  }

  async wakeCarAction(flowId) {
    let wakeCar = this.homey.flow.getActionCard(flowId)

    wakeCar.registerRunListener(async () => {
      if (await this.homey.app.isOnline({ id: this.getData().id, token: this.homey.app.getToken().accessToken }) === 'asleep') {
        this.log('Car is asleep')
        try {
          await this.homey.app.wakeCar({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
          this.log('Woke up car')
        } catch (error) {
          this.log(error)
        }
      }
    })
  }

  async stateOfCharge(flowId) {
    let stateOfCharge = this.homey.flow.getConditionCard(flowId)

    stateOfCharge.registerRunListener(async ({ soc, state }) => {

      this.log('Check if the car is asleep. If it is, call the wakeCar function')
      if (await this.homey.app.isOnline({ id: this.getData().id, token: this.homey.app.getToken().accessToken }) === 'asleep') {
        this.log('Car is asleep')
        await this.homey.app.wakeCar({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
      }

      try {
        // check the soc
        const { response: { batteryLevel, chargeEnableRequest } } = await Tesla.vehicles.chargeState({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
        this.log('The batteryLevel checked and at : ' + batteryLevel)
        if (batteryLevel >= soc && typeof batteryLevel == 'number') {
          return true
        } else {
          return false
        }
      } catch (error) {
        this.log(error)
      }

    })
  }


  async carIsCharging(flowId) {
    let carIsChargingCard = this.homey.flow.getConditionCard(flowId)

    carIsChargingCard.registerRunListener(async () => {

      this.log('Check if the car is asleep. If it is, call the wakeCar function')
      if (await this.homey.app.isOnline({ id: this.getData().id, token: this.homey.app.getToken().accessToken }) === 'asleep') {
        this.log('Car is asleep')
        await this.homey.app.wakeCar({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
      }

      try {
        // check the soc
        const { response: { chargingState} } = await Tesla.vehicles.chargeState({ id: this.getData().id, token: this.homey.app.getToken().accessToken })
        this.log('The charging state checked and is : ' + chargingState)
        if (chargingState === 'Charging') {
          return true
        } else {
          return false
        }
      } catch (error) {
        this.log(error)
      }

    })
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
