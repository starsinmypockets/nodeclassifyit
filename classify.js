const _confirmed = 'train/confirmed.csv'
const _deleted = 'train/deleted.csv' 
const csv = require('csvtojson')
const bayes = require('bayes')
const CONFFIELD = 'field9'
const DELFIELD = 'field18'

class Events {
  async init(cb) {
    this.confirmed = await csv().fromFile(_confirmed)
    this.deleted = await csv().fromFile(_deleted)
    this.classifier = bayes()

    for (let i = 0; i < 100; i++) {
       this.classifier.learn(this.confirmed[i][CONFFIELD], 'confirmed')
       this.classifier.learn(this.deleted[i][DELFIELD], 'deleted')
    }

    cb.bind(this)()
  }

  classify(str) {
    return this.classifier.categorize(str)
  }
}

module.exports = {
  Events: Events
}
