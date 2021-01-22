const config = require('../config.json');
const discordDatabase = require('../discorddatabase')
var wsConnection
var dcClient
var enableEvent = (function(discordClient,websocketConnection){
    wsConnection=websocketConnection
    dcClient=discordClient
    discordClient.on('messageReactionAdd', handler)
    discordClient.on('messageReactionRemove', handler)
    
})
function handler(messageReaction){
    var message = messageReaction.message
    if(message.author.id==dcClient.user.id){
        console.log("bot message")
    }
}
module.exports = enableEvent;