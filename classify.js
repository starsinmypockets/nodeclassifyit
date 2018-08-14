const _confirmed = 'train/confirmed.csv'
const _deleted = 'train/deleted.csv' 
const csv = require('csvtojson')

class Events {
  async init(cb) {
    this.confirmed = await csv().fromFile(_confirmed)
    this.deleted = await csv().fromFile(_deleted)
    cb.bind(this)()
  }
}

module.exports = {
  Events: Events
}
