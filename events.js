const csv = require('csvtojson')
const json2csv = require('json2csv').parse
const fs = require('fs')
const bayes = require('bayes')
const config = require('./config.js')
const firstNames = require('./first-names.json')
const middleNames = require('./middle-names.json')
const lastNames = require('./names.json')
const placeNames = require('./places.json')
const myStopWords = firstNames.concat(middleNames).concat(lastNames).concat(placeNames).map(w => w.toLowerCase())

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

console.log("stop words:", myStopWords.length, firstNames.length, middleNames.length, lastNames.length, placeNames.length)

const _confirmed = 'train/confirmed.csv'
const _deleted = 'train/deleted.csv' 

class Events {
  async init(cb) {
    debugger;
    this.confirmed = shuffle(await csv().fromFile(_confirmed))
    this.deleted = shuffle(await csv().fromFile(_deleted))
    
    console.log('confirmed', this.confirmed[0])
    console.log('deleted', this.deleted[0])
    this.classifier = bayes({tokenizer: this.tokenizer})
    this.train()
    
    return Promise.resolve()
  }
  
  tokenizer(text) {
    if (text){
    return text.toLowerCase()
      .replace(/(https?:\/\/[^\s]+)/g,"") // no urls
      .replace(/[.,\/#!$%'\^&\*;:{}=\-_`~()\r\n\t\\]/g,"") // no punctuation newline tab etc
      .replace(/[0-9]/g, '') // no numbers
      .split(' ')
      .filter(w => myStopWords.indexOf(w) < 0)
    } else {
      return []
    }
  }
  
  train() {
      // less weight on provided confirmed words to avoid false pos
      this.classifier.learn(config.confirmed_words.join(', '), 'confirmed')

    // use the first 100 records to train the model
    for (let i = 0; i < (this.confirmed.length * .2); i++) {
      const title = this.confirmed[i][config.confirmedTrainTitleField]
      const desc = this.confirmed[i][config.confirmedTrainField]
      const str = title + ' ' + desc

      this.classifier.learn(str, 'confirmed')
    }
    
    for (let i = 0; i < (this.deleted.length *.2); i++) {
      const title = this.deleted[i][config.deletedTrainTitleField]
      const desc = this.deleted[i][config.deletedTrainField]
      const str = title + ' ' + desc

      // more weight on provided terms to prefer false negative
      this.classifier.learn(config.delete_words.join(', '), 'deleted')
      this.classifier.learn(str, 'deleted')
    }
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
  
  showModel() {
    console.dir(JSON.parse(this.classifier.toJson()))
  }
}

module.exports = {
  Events: Events
}
