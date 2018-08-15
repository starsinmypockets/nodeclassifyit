const assert = require('assert')
const Classify = require('../classify.js').Events
const config = require('../config.js')
const cl = new Classify()
const CONFFIELD = 'field9' // @@TODO use config
const DELFIELD = 'field18' // @@TODO use config

describe('test classifier', async () => {
  console.log('INIT')
  await cl.init()
  const confTests = cl.confirmed.length
  const delTests = cl.deleted.length 
  
  // keep track of miscalcs
  let falseConf = 0
  let falseDel = 0
  let falseConfJson = []
  let falseDelJson = []
  
  // @@TODO use title field in conjunction with description
      
  for (let i = 100; i < confTests; i++) {
    if (cl.classify(cl.confirmed[i][CONFFIELD]) !== 'confirmed') {
      falseDel++
      falseDelJson.push(cl.confirmed[i][CONFFIELD])
    }
  }
  
  for (let i = 100; i < delTests; i++) {
    if (cl.classify(cl.deleted[i][DELFIELD]) !== 'deleted') {
      falseConf++
    }
  }

  console.log("Confirmed success: ", falseDel, confTests, falseDel / confTests)
  console.log("Confirmed deletes: ", falseConf, delTests, falseConf / delTests)
})
