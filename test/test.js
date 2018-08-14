const assert = require('assert')
const Classify = require('../classify.js').Events
const cl = new Classify()

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1)
    })
  })
})

describe('test classifier', () => {
  cl.init(() => {
    it ('should initialize without error', () => {
      console.log(cl.confirmed.length, cl.deleted.length)
      for (let i = 144; i < 150; i++) {
        console.log("CONFIRMED", cl.confirmed[i].field9)
        console.log("DELETED", cl.deleted[i].field18)
      }
      assert(true)
    })
  })
})
