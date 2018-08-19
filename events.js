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

const _confirmed = 'train/confirmed.csv'
const _deleted = 'train/deleted.csv' 

class Events {
  async init(cb) {
    this.confirmed = shuffle(await csv().fromFile(_confirmed))
    this.deleted = shuffle(await csv().fromFile(_deleted))
    this.classifier = bayes({tokenizer: this.tokenize})
    this.train()  

    return Promise.resolve()
  }

  debug() {
    const m = JSON.parse(this.classifier.toJson())
    const confWordCount = m.wordFrequencyCount.confirmed
    const delWordCount = m.wordFrequencyCount.deleted
    const newWordFrequencyCount = [confWordCount, delWordCount].map(col => {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
      Object.keys(col).forEach(k => {
        if (col[k] > 20) {
          console.log(k, col[k])
        }
      })
    })
    
    this.showModel()
  }
  
  tokenize(text) {
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
  
  // @@TODO paramaterize training vs testing sets
  train() {
    for (let i = 0; i < (this.confirmed.length); i++) {
      const title = this.confirmed[i][config.confirmedTrainTitleField]
      const desc = this.confirmed[i][config.confirmedTrainField]
      const str = title + ' ' + desc

      this.classifier.learn(str, 'confirmed')
    }
    
    for (let i = 0; i < (this.deleted.length); i++) {
      const title = this.deleted[i][config.deletedTrainTitleField]
      const desc = this.deleted[i][config.deletedTrainField]
      const str = title + ' ' + desc

      this.classifier.learn(str, 'deleted')
    }
  }

  arrayOverlap(arr1, arr2) {
    const overlap = arr1.filter(value => -1 !== arr2.indexOf(value))
    return overlap
  }

  classify(str) {
    return this.classifier.categorize(str)
  }

  // events with delete_words classify immediately
  classifyByKeyword(eventArr, keywordArr, cat) {
    for (let i = 0; i < eventArr.length; i++) {
      console.log(this.arrayOverlap(eventArr[i], keyWordArr).length)
    }
  }

  searchCat(str) {
    return str.split('_')[0]
  }

  async classifyInput() {
    const eventCats = {}

    try {
      const events = await csv().fromFile(config.inputPath)
      console.log("events", events.length)
      
      for (let i = 0; i < events.length; i++) {
        const desc = events[i][config.inputDataField]
        const title = events[i][config.inputDataTitleField]
        const str = (desc + ' ' + title).toLowerCase()
        let doProbSort = false
        
        // for each search category, do string search and bucket
        config.searchOrder.forEach(searchSet => {
          const searchCat = this.searchCat(searchSet)
          if (!eventCats[searchCat]) eventCats[searchCat] = []

          config[searchSet].forEach(searchStr => {
            const re = new RegExp(searchStr.toLowerCase(), "g")
            if (re.test(str)) {
              eventCats[searchCat].push(events[i])
            } else {
              doProbSort = true
            }
          }) 
        })
        
        // if no results from string search, use bayesian classifier
        if (doProbSort) {
          const filtered = this.tokenize(str).join(' ')
          const result = this.classify(filtered)
          console.log("RR", result)
          eventCats[result].push
        }
      }
    } catch (e) {
      console.error("Error at classifyInput", e)
    } finally {
      console.log("events", Object.keys(eventCats).map(cat => {console.log(cat, eventCats[cat].length)}))
      return eventCats
    }
  }

  async outputCSV(fmlename, data) {
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
