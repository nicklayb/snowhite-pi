# snowhite-pi

[Snowhite](https://github.com/nicklayb/snowhite) auto power on pir sensor

## Features

- Power off/on a relay based a PIR sensor trigger
- Expose an HTTP server using Express to control the relay state
- Calls [Homebridge Notification](https://github.com/Supereg/homebridge-http-notification-server) server for relay state update
- Expose a CLI for controlling relay
- Optionally publish and control the relay state over MQTT, with Home Assistant discovery

## MQTT

Enabled when `MQTT_URL` is set (e.g. `mqtt://192.168.1.159:1883`), disabled with `--no-mqtt`.

| Variable | Default | Description |
|---|---|---|
| `MQTT_URL` | | Broker URL |
| `MQTT_USERNAME` / `MQTT_PASSWORD` | | Broker credentials |
| `MQTT_DISCOVERY_PREFIX` | `homeassistant` | Home Assistant discovery prefix |
| `MQTT_NODE_ID` | `snowhite` | Prefix of the state topics and unique id |
| `COLOR_SCHEME_FILE` | | Enables the `Color scheme` select, stored in this file |

Home Assistant discovers a `Snowhite` device with a `Display` switch.
State is retained on `snowhite/display/state` (`ON`/`OFF`), commands go to `snowhite/display/set`
and availability to `snowhite/availability`.

When `COLOR_SCHEME_FILE` is set, a `Color scheme` select (`light`/`dark`) is also discovered
(`snowhite/color_scheme/state` and `snowhite/color_scheme/set`).
Selecting an option writes it to the file, which the kiosk watches to restart its browser in that scheme.
