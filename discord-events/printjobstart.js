const chatUtil = require('../utils/chatUtil')

const enableEvent = function (discordClient) {
    discordClient.on('messageReactionAdd', (msgreaction, user) => {
        if (!chatUtil.hasMessageEmbed(msgreaction.Message)) {
            return
        }
        if (user.id === discordClient.user.id) {
            return
        }
        //const title = msg.embeds[0].title
        console.log(msgreaction)
    })
}
module.exports = enableEvent
