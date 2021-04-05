const chatUtil = require('../utils/chatUtil')

const enableEvent = function (discordClient) {
    discordClient.on('message', msg => {
        if (!chatUtil.hasMessageEmbed(msg)) {
            return
        }
        if (msg.author.id !== discordClient.user.id) {
            return
        }
        const title = msg.embeds[0].title
        console.log(title)
    })
    discordClient.on('debug', debug => { console.log(debug)})
}
module.exports = enableEvent
