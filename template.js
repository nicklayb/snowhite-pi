const actions = [
  ['/toggle', 'Toggle'],
  ['/open_temp', 'Open temp']
]

const renderAction = ([link, text]) => `
<li>
  <a href="${link}">${text}</a>
</li>
`

const render = ({ state }) => `
<div>
  <h1>State: ${state === 1 ? 'On' : 'Off'}</h1>
  <ul>
    ${actions.map(renderAction).join('')}
  </ul>
</div>
`

module.exports = {
  render
}
