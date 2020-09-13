const bent = require('bent')
const State = require('./state')

const HOST = process.env.NOTIFICATION_HOST || '192.168.1.11'
const PORT = process.env.NOTIFICATION_PORT || 8099

const request = bent(`http://${HOST}:${PORT}`, 'POST', 'buffer', 200)

const log = (message, type = 'log') => console[type](`[NOTIFICATION] ${message}`)

const createBody = status => ({
  characteristic: 'On',
  value: status,
})

const notify = (accessoryId, status) => {
  const boolStatus = status === 1 || status === true
  request(`/${accessoryId}`, createBody(boolStatus))
    .then(() => {
      log(`${accessoryId} -> ${boolStatus}`)
    })
    .catch((e) => {
      log(`${accessoryId} ${e.message}`, 'error')
    })
}

const init = () => {
  State.onUpdate(value => {
    notify('mirror', value)
  })
}

module.exports = {
  init
}
