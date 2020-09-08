let state = -1

const handlers = []

const getState = () => state

const fireEvent = () => handlers.forEach(handler => handler(getState()))

const update = (value) => {
	console.log(`[STATE] Updating from ${getState()} to ${value}`)
	state = value
	fireEvent()
}

const reverseState = () => state === 1 ? 0 : 1

const toggle = () => update(reverseState())

const setOn = () => update(1)

const setOff = () => update(0)

const openFor = (timeout) => {
	setOn()
	setTimeout(setOff, timeout)
}

const onUpdate = (handler) => handlers.push(handler)

module.exports = {
	onUpdate,
	update,
	getState,
	setOn,
	setOff,
	reverseState,
	toggle,
	openFor
}
