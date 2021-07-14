const variables = require('../utils/variablesUtil')

const event = (message) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)
  console.log(messageJson)
}
module.exports = event
