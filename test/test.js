const assert = require('assert')
const Classify = require('../events.js').Events
const config = require('../config.js')
const cl = new Classify()
const CFT = config.confirmedTrainTitleField
const CFD = config.confirmedTrainField
const DFT = config.deletedTrainTitleField
const DFD =config.deletedTrainField

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
  
  cl.classifyInput()


  /* for (let i = 0; i < confTests; i++) { */
  /*   const str = cl.confirmed[i][CFT] + ' ' + cl.confirmed[i][CFD] */ 
  /*   const res = cl.classify(str) */
  /*   if (res !== 'confirmed') { */
  /*     falseDel++ */
  /*     falseDelJson.push(cl.confirmed[i]) */
  /*   } */
  /* } */
  
  /* for (let i = 0; i < delTests; i++) { */
  /*   const str = cl.deleted[i][DFT] + ' ' + cl.deleted[i][DFD] */ 
  /*   const res = cl.classify(str) */
    
  /*   if (res !== 'deleted') { */
  /*     falseConf++ */
  /*     falseDelJson.push(cl.confirmed[i]) */
  /*   } */
  /* } */

/*   const results = { */
/*     confirmedPositive: { */
/*       testSetSize: confTests, */
/*       falseResult: falseDel, */
/*       accurracy: 1 - falseDel / confTests */
/*     }, */
/*     confirmedNegative: { */
/*       testSetSize: delTests, */
/*       falseResult: falseConf, */
/*       accurracy: 1 - falseConf / delTests */
/*     } */
/*   } */

/*   console.log('Test results') */
/*   console.dir(results) */
})
