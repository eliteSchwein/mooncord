const event = (message, connection, discordClient, database) => {
    if (message.type !== 'utf8') { return }
  
    const messageJson = JSON.parse(message.utf8Data)

    if (typeof(messageJson.result) === 'undefined') { return }
    if (typeof(messageJson.result) === 'undefined') { return }

    const status = messageJson.respond.status

    if (typeof(status.configfile) === 'undefined') { return }

    console.log(status)
}
module.exports = event