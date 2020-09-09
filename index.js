const Server = require('./server.js')
const Hardware = require('./hardware.js')
const Cli = require('./cli.js')

if (!process.argv.includes('--no-hardware')) {
  Hardware.init()
}

if (!process.argv.includes('--no-server')) {
  Server.init()
} else {
  Cli.init(process.argv)
}
