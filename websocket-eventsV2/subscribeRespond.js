const event = (message, connection, discordClient, database) => {
    if (message.type !== 'utf8') { return }
  
    const messageJson = JSON.parse(message.utf8Data)

    if (typeof(messageJson.result) === 'undefined') { return }
    if (typeof(messageJson.result.status) === 'undefined') { return }

    const status = messageJson.result.status

    if (typeof(status.configfile) === 'undefined') { return }

    console.log(status)
}
module.exports = event