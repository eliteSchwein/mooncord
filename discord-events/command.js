const config = require('../config.json');
const commandHandler = require("../discord-commands/index")
var enableEvent = (function(discordClient,discordDataBase){
    discordClient.on('message', msg => {
        if (msg.toString().startsWith(config.prefix)) {
          commandHandler(msg.toString().substring(config.prefix),msg.channel,msg.author,discordClient,discordDataBase)
        }
      });
})
module.exports = enableEvent;