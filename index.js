const Server = require('./server.js')
const Hardware = require('./hardware.js')
const Cli = require('./cli.js')
const Notification = require('./notification.js')
const Mqtt = require('./mqtt.js')

if (!process.argv.includes('--no-notification')) {
  Notification.init()
}

if (Mqtt.isEnabled() && !process.argv.includes('--no-mqtt')) {
  Mqtt.init()
}

if (!process.argv.includes('--no-hardware')) {
  Hardware.init()
}

if (!process.argv.includes('--no-server')) {
  Server.init()
} else {
  Cli.init(process.argv)
}
