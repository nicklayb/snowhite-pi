const fs = require('fs')

const FILE = process.env.COLOR_SCHEME_FILE
const LIGHT = 'light'
const DARK = 'dark'
const OPTIONS = [LIGHT, DARK]

/**
 * Tells whether the color scheme file is configured through COLOR_SCHEME_FILE.
 */
const isEnabled = () => Boolean(FILE)

const isValid = (scheme) => OPTIONS.includes(scheme)

/**
 * Reads the current color scheme, falling back to light when the file is missing or invalid.
 */
const read = () => {
  try {
    const scheme = fs.readFileSync(FILE, 'utf8').trim()
    return isValid(scheme) ? scheme : LIGHT
  } catch (error) {
    return LIGHT
  }
}

/**
 * Writes the color scheme when it differs from the current one, since every write restarts the kiosk.
 * Returns whether the file was written.
 */
const write = (scheme) => {
  if (!isValid(scheme) || scheme === read()) return false

  fs.writeFileSync(FILE, `${scheme}\n`)
  return true
}

module.exports = {
  OPTIONS,
  isEnabled,
  isValid,
  read,
  write
}
