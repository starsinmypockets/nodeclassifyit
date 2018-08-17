const Events = require('./events.js').Events
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
