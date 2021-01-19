const config = require('../config.json');
const commandHandler = require("../discord-commands/index")
const prefix = "ex!"
var enableEvent = (function(discordClient,discordDataBase){
    discordClient.on('message', msg => {
        if (msg.toString().startsWith(prefix)) {
          commandHandler(msg.toString().substring(prefix.length),msg.channel,msg.author,discordClient,discordDataBase,prefix)
        }
      });
})
module.exports = enableEvent;