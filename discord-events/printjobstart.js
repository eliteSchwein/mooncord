const chatUtil = require('../utils/chatUtil')

const enableEvent = function (discordClient) {
    discordClient.on('messageReactionAdd', (msgreaction, user) => {
        //if (!chatUtil.hasMessageEmbed(msg)) {
        //    return
        //}
        //if (msg.author.id !== discordClient.user.id) {
        //    return
        //}
        //const title = msg.embeds[0].title
        console.log(msgreaction)
    })
}
module.exports = enableEvent
