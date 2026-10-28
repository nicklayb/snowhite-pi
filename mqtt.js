const mqtt = require('mqtt')
const State = require('./state.js')
const ColorScheme = require('./color_scheme.js')

const URL = process.env.MQTT_URL
const USERNAME = process.env.MQTT_USERNAME
const PASSWORD = process.env.MQTT_PASSWORD
const DISCOVERY_PREFIX = process.env.MQTT_DISCOVERY_PREFIX || 'homeassistant'
const NODE_ID = process.env.MQTT_NODE_ID || 'snowhite'

const ON = 'ON'
const OFF = 'OFF'
const ONLINE = 'online'
const OFFLINE = 'offline'

const entityTopics = (component, objectId) => ({
  state: `${NODE_ID}/${objectId}/state`,
  command: `${NODE_ID}/${objectId}/set`,
  discovery: `${DISCOVERY_PREFIX}/${component}/${NODE_ID}/${objectId}/config`
})

const TOPICS = {
  availability: `${NODE_ID}/availability`,
  homeAssistantStatus: `${DISCOVERY_PREFIX}/status`,
  display: entityTopics('switch', 'display'),
  colorScheme: entityTopics('select', 'color_scheme')
}

const DEVICE = {
  identifiers: [NODE_ID],
  name: 'Snowhite',
  model: 'Raspberry Pi 3 Model B'
}

const RETAINED = { retain: true }

const log = (message, type = 'log') => console[type](`[MQTT] ${message}`)

const entityDiscovery = (topics, objectId, attributes) => ({
  unique_id: `${NODE_ID}_${objectId}`,
  command_topic: topics.command,
  state_topic: topics.state,
  availability_topic: TOPICS.availability,
  device: DEVICE,
  ...attributes
})

const displayDiscovery = () => entityDiscovery(TOPICS.display, 'display', {
  name: 'Display',
  icon: 'mdi:monitor',
  payload_on: ON,
  payload_off: OFF
})

const colorSchemeDiscovery = () => entityDiscovery(TOPICS.colorScheme, 'color_scheme', {
  name: 'Color scheme',
  icon: 'mdi:theme-light-dark',
  options: ColorScheme.OPTIONS
})

const isKnownState = (value) => value === 1 || value === 0

const toPayload = (value) => value === 1 ? ON : OFF

/**
 * Tells whether MQTT is configured, MQTT_URL being the only required setting.
 */
const isEnabled = () => Boolean(URL)

/**
 * Connects to the broker, announces the entities through Home Assistant MQTT discovery
 * (the display switch, plus the kiosk color scheme select when COLOR_SCHEME_FILE is set),
 * publishes their state and applies the commands received from Home Assistant.
 */
const init = () => {
  const client = mqtt.connect(URL, {
    username: USERNAME,
    password: PASSWORD,
    will: { topic: TOPICS.availability, payload: OFFLINE, ...RETAINED }
  })

  const publishJson = (topic, payload) => client.publish(topic, JSON.stringify(payload), RETAINED)

  const publishDiscovery = () => {
    publishJson(TOPICS.display.discovery, displayDiscovery())
    if (ColorScheme.isEnabled()) publishJson(TOPICS.colorScheme.discovery, colorSchemeDiscovery())
  }

  const publishDisplayState = (value) => {
    if (isKnownState(value)) client.publish(TOPICS.display.state, toPayload(value), RETAINED)
  }

  const publishColorScheme = () => client.publish(TOPICS.colorScheme.state, ColorScheme.read(), RETAINED)

  const applyDisplayCommand = (payload) => {
    log(`Received display command ${payload}`)

    if (payload === ON) return State.setOn()
    if (payload === OFF) return State.setOff()

    log(`Ignoring unknown display command ${payload}`, 'error')
  }

  const applyColorSchemeCommand = (payload) => {
    log(`Received color scheme command ${payload}`)

    if (!ColorScheme.isValid(payload)) return log(`Ignoring unknown color scheme ${payload}`, 'error')
    if (ColorScheme.write(payload)) log(`Color scheme switched to ${payload}`)
    publishColorScheme()
  }

  const subscriptions = () => [
    TOPICS.homeAssistantStatus,
    TOPICS.display.command,
    ...(ColorScheme.isEnabled() ? [TOPICS.colorScheme.command] : [])
  ]

  client.on('connect', () => {
    log(`Connected to ${URL}`)
    client.publish(TOPICS.availability, ONLINE, RETAINED)
    publishDiscovery()
    publishDisplayState(State.getState())
    if (ColorScheme.isEnabled()) publishColorScheme()
    client.subscribe(subscriptions())
  })

  client.on('message', (topic, message) => {
    const payload = message.toString()

    if (topic === TOPICS.display.command) return applyDisplayCommand(payload)
    if (topic === TOPICS.colorScheme.command) return applyColorSchemeCommand(payload)
    if (topic === TOPICS.homeAssistantStatus && payload === ONLINE) publishDiscovery()
  })

  client.on('error', (error) => log(error.message, 'error'))

  State.onUpdate(publishDisplayState)
}

module.exports = {
  isEnabled,
  init
}
