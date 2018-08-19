const csv = require('csvtojson')
const json2csv = require('json2csv').parse
const fs = require('fs')
const bayes = require('bayes')

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

function loadStopWords() {
  var firstNames, middleNames, lastNames, placeNames
  try {
    firstNames = JSON.parse(fs.readFileSync('./config/first-names.json', 'utf8'))
    middleNames = JSON.parse(fs.readFileSync('./config/middle-names.json', 'utf8'))
    lastNames = JSON.parse(fs.readFileSync('./config/last-names.json', 'utf8'))
    placeNames = JSON.parse(fs.readFileSync('./config/place-names.json', 'utf8'))

    const stopWords = firstNames.concat(middleNames).concat(lastNames).concat(placeNames).map(w => w.toLowerCase())
    return stopWords
  } catch (e) {
    console.log("Error loading stopwords", e)
    // degrade but continue with no stopwords
    return []
  } 
}

const _confirmed = 'train/confirmed.csv'
const _deleted = 'train/deleted.csv' 

class Events {
  async init() {
      this.confirmed = shuffle(await csv().fromFile(_confirmed))
      this.deleted = shuffle(await csv().fromFile(_deleted))
      this.config = JSON.parse(fs.readFileSync(__dirname + '/config/config.json', 'utf8'))
      this.config.doProbSort = true

      this.stopWords = loadStopWords()
      this.classifier = bayes({tokenizer: this.tokenize})
      this.classifier.stopWords = this.stopWords
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
    const stopWords = this.stopWords
    if (text){
    return text.toLowerCase()
      .replace(/(https?:\/\/[^\s]+)/g,"") // no urls
      .replace(/[.,\/#!$%'\^&\*;:{}=\-_`~()\r\n\t\\]/g,"") // no punctuation newline tab etc
      .replace(/[0-9]/g, '') // no numbers
      .split(' ')
      .filter(w => stopWords.indexOf(w) < 0)
    } else {
      return []
    }
  }
  
  // @@TODO paramaterize training vs testing sets
  train() {
    for (let i = 0; i < (this.confirmed.length); i++) {
      const title = this.confirmed[i][this.config.confirmedTrainTitleField]
      const desc = this.confirmed[i][this.config.confirmedTrainField]
      const str = title + ' ' + desc

      this.classifier.learn(str, 'confirmed')
    }
    
    for (let i = 0; i < (this.deleted.length); i++) {
      const title = this.deleted[i][this.config.deletedTrainTitleField]
      const desc = this.deleted[i][this.config.deletedTrainField]
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

  searchCat(str) {
    return str.split('_')[0]
  }

  async classifyInput() {
    debugger;
    const eventCats = {}

    try {
      const events = await csv().fromFile(this.config.inputPath)
      
      for (let i = 0; i < events.length; i++) {
        const desc = events[i][this.config.inputDataField]
        const title = events[i][this.config.inputDataTitleField]
        const str = (desc + ' ' + title).toLowerCase()
        let doProbSort = false
        
        // for each search category, do string search and bucket
        this.config.searchOrder.forEach(searchSet => {
          const searchCat = this.searchCat(searchSet)
          if (!eventCats[searchCat]) eventCats[searchCat] = []

          this.config[searchSet].forEach(searchStr => {
            const re = new RegExp(searchStr.toLowerCase(), "g")
            if (re.test(str)) {
              eventCats[searchCat].push(events[i])
            } else {
              doProbSort = true
            }
          }) 
        })

        
        // if no results from string search, use bayesian classifier
        if (doProbSort && this.config.doProbSort) {
          const filtered = this.tokenize(str).join(' ')
          const result = this.classify(filtered)
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

  async outputCSV(filename, data) {
    console.log('CSV output info:', this.config.outputDir, filename)
    const body = json2csv(data)
    const filepath = this.config.outputDir + '/' + filename + '.csv'

    try {
      fs.writeFile(filepath, body, 'utf8', (err) => {
        if (err) {
            throw (err)
        }
      })
    } catch (e) {
      console.log("Error outputing CSV ", filename, e)
      console.log("Make sure to use an absolute path to the output directory in config/config.json. Make sure the output directory exists, and that it is writeable. :)")
    } 
  }
  
  showModel() {
    console.dir(JSON.parse(this.classifier.toJson()))
  }
}

module.exports = {
  Events: Events
}
