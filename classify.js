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
    
    // use the first 100 records to train the model
    for (let i = 0; i < this.confirmed.length; i++) {
     this.classifier.learn(this.confirmed[i][CONFFIELD], 'confirmed')
    }
    
    for (let i = 0; i < this.deleted.length; i++) {
     this.classifier.learn(this.deleted[i][DELFIELD], 'deleted')
    }

    return Promise.resolve()
  }

  classify(str) {
    return this.classifier.categorize(str)
  }
}

module.exports = {
  Events: Events
}
