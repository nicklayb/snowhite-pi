const express = require('express')
const Template = require('./template.js')
const State = require('./state.js')

const App = express()
const PORT = process.env.PORT || 3000

const log = (message, type = 'log') => console[type](`[SERVER] ${message}`)

App.get('/', (req, res) => {
    res.send(Template.render({ state: State.getState() }))
})

App.get('/toggle', (req, res) => {
  log('GET /toggle')
  State.toggle()
  res.redirect('/')
})

App.get('/on', (req, res) => {
  log('GET /on')
  State.setOn()
  res.redirect('/')
})

App.get('/off', (req, res) => {
  log('GET /off')
  State.setOff()
  res.redirect('/')
})

App.get('/open_temp', (req, res) => {
  log('GET /open_temp')
  State.openFor(1000)
  res.redirect('/')
})

App.get('/status', (req, res) => {
  log('GET /status')
  res.send(`${State.getState()}`)
})

const init = () => {
  App.listen(PORT, () => {
      log(`Running express on http://localhost:${PORT}`)
  })
}

module.exports = {
  App,
  init
}
