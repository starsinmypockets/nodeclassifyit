const assert = require('assert')
const Classify = require('../events.js').Events
const config = require('../config/config.json')
const cl = new Classify()

describe('array overlap works', async () => {
  console.log(__dirname)
  it('Classify algorith should work - training confirmed data', () => {
    cl.init()
      .then(async () => {
        cl.config.inputPath = __dirname + "/../train/confirmed.csv"
        cl.config.inputTitleField = config.confirmedTrainTitleField
        cl.config.inputDataField = config.confirmedTrainField
        const results = await cl.classifyInput()
        console.log("Classify confirmed results: ", results.confirmed.length, results.deleted.length)
        assert('Has confirmed results... many', results.confirmed && results.confirmed.length > 100)
        assert('Has deleted results.... few', results.deleted && results.deleted.length < 100)
      })
    assert (true)
  })
  
  it('Classify algorith should work - training deleted data', () => {
    cl.init()
      .then(async () => {
        cl.config.inputPath = __dirname + "/../train/deleted.csv"
        cl.config.inputTitleField = config.deletedTrainTitleField
        cl.config.inputDataField = config.deletedTrainField
        const results = await cl.classifyInput()
        console.log("Classify confirmed results: ", results.confirmed.length, results.deleted.length)
        assert('Has confirmed results... few', results.confirmed && results.confirmed.length < 100)
        assert('Has deleted results.... many', results.deleted && results.deleted.length > 100)
      })
    assert (true)
  })
})
