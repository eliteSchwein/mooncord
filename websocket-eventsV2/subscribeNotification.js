const objects = require('./objectHandlers')

const event = (message, connection, discordClient, database) => {
  if (message.type !== 'utf8') { return }
  
  const messageJson = JSON.parse(message.utf8Data)

  if (typeof (messageJson.method) === 'undefined') { return }
  if (messageJson.method !== 'notify_status_update') { return }

  if (typeof (messageJson.params) === 'undefined') { return }

  const status = messageJson.params[0]

  for (const object in objects) {
    objects[object](status, connection, discordClient.getClient, database)
  }
}
module.exports = event