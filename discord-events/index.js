const command = require("./command")
const reaction = require("./reaction")
const upload = require("./upload")

var getModules = (function(discordClient,websocketConnection){
    command(discordClient,websocketConnection)
    reaction(discordClient,websocketConnection)
    upload(discordClient,websocketConnection)
    
})
module.exports = getModules;