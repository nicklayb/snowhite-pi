const State = require('./state.js')

const COMMANDS = {
  set_on: () => State.setOn(),
  set_off: () => State.setOff()
}

const init = (args) => {
  args.forEach(arg => {
    const command = COMMANDS[arg]

    if (command) {
      console.log(`[CLI] Running ${arg}`)
      command()
    }
  })
}

module.exports = {
  init
}
