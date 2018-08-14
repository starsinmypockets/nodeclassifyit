const assert = require('assert')
const Classify = require('../classify.js').Events
const cl = new Classify()
const CONFFIELD = 'field9'
const DELFIELD = 'field18'

describe('test classifier', async () => {
  console.log('INIT')
  await cl.init()
  const confTests = cl.confirmed.length - 100
  const delTests = cl.deleted.length - 100
  
  let falseConf = 0
  let falseDel = 0
  
  console.log("CONFIRMED", confTests)
  console.log("DELETED", delTests)
      
  for (let i = 100; i < 100 + confTests; i++) {
    if (cl.classify(cl.confirmed[i][CONFFIELD]) !== 'confirmed') {
      falseDel++
    }
    console.log(">>>", cl.classify(cl.confirmed[i][CONFFIELD]))
  }
  
  for (let i = 100; i < 100 + delTests; i++) {
    if (cl.classify(cl.deleted[i][DELFIELD]) !== 'deleted') {
      falseConf++
    }
    console.log(">>>", cl.classify(cl.deleted[i][DELFIELD]))
  }

  console.log("Confirmed success: ", falseDel, confTests, falseDel / confTests)
  console.log("Confirmed deletes: ", falseConf, delTests, falseConf / delTests)
})
