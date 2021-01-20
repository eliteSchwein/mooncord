const command = require("./command")

var getModules = (function(discordClient,websocketConnection){
    command(discordClient,websocketConnection)
    
})
module.exports = getModules;