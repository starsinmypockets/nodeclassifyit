const csv = require('csvtojson')
const json2csv = require('json2csv').parse
const fs = require('fs')
const bayes = require('bayes')
const config = require('./config.js')

const _confirmed = 'train/confirmed.csv'
const _deleted = 'train/deleted.csv' 

class Events {
  async init(cb) {
    this.confirmed = await csv().fromFile(_confirmed)
    this.deleted = await csv().fromFile(_deleted)
    this.classifier = bayes()
    
    // use the first 100 records to train the model
    for (let i = 0; i < this.confirmed.length; i++) {
      const title = this.confirmed[i][config.confirmedTrainTitleField]
      const desc = this.confirmed[i][config.confirmedTrainField]
      const str = title + ' ' + desc

      this.classifier.learn(str, 'confirmed')
    }
    
    for (let i = 0; i < this.deleted.length; i++) {
      const title = this.deleted[i][config.deletedTrainTitleField]
      const desc = this.deleted[i][config.deletedTrainField]
      const str = title + ' ' + desc

      this.classifier.learn(str, 'deleted')
    }

    return Promise.resolve()
  }

  classify(str) {
    return this.classifier.categorize(str)
  }

  async classifyInput() {
    let confirmedEvents = []
    let deletedEvents = []
    
    try {
      const events = await csv().fromFile(config.inputPath)
      
      for (let i = 0; i < events.length; i++) {
        const desc = events[i][config.inputDataField]
        const title = events[i][config.inputDataTitleField]
        const str = desc + ' ' + title
        const result = this.classify(str)

        if (result === 'confirmed') {
          confirmedEvents.push(events[i])
        } else if (result === 'deleted') {
          deletedEvents.push(events[i])
        } else {
          console.log('Error classifying ', i)
        }
      }

      console.log("confirmed", confirmedEvents.length, "deleted", deletedEvents.length)
    } catch (e) {
      console.error("Error at classifyInput", e)
    } finally {
      return { confirmed: confirmedEvents, deleted: deletedEvents }
    }
  }

  async outputCSV(filename, data) {
    const body = json2csv(data)
    const filepath = __dirname + '/' + config.outputDir + '/' + filename + '.csv'

    try {
      fs.writeFile(filepath, body, 'utf8', (err) => {
        if (err) {
            throw (err)
        }
      })
    } catch (e) {
      console.log("Error outputing CSV ", filename, e)
    } 
  }
}

const cl = new Events()
cl.init().then(() => {
  cl.classifyInput().then(res => {
    Promise.all([
      cl.outputCSV('confirmed', res.confirmed),
      cl.outputCSV('deleted', res.deleted)
    ]).then(() => {
      console.log('Output categorized CSV files to configured path')
    }).catch(e => {
      console.log('Error generating CSV files', e)
    })
  })
})

module.exports = {
  Events: Events
}
