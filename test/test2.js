const assert = require('assert')
const Classify = require('../events.js').Events
const config = require('../config.js')
const cl = new Classify()
const CFT = config.confirmedTrainTitleField
const CFD = config.confirmedTrainField
const DFT = config.deletedTrainTitleField
const DFD =config.deletedTrainField

describe('array overlap works', async () => {
  it('overlap should be proper length', () => {
    const ov1 = cl.arrayOverlap(['foo', 'bar', 'baz'], ['foo', 'bar'])
    const ov2 = cl.arrayOverlap(['foo', 'bar'], ['baz', 'bat'])
    console.log(ov1, ov2)
    assert(ov1.length === 2)
    assert(ov2.length === 0)
  })
})
