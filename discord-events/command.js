const config = require('../config.json');
const commandHandler = require("../discord-commands/index")
const discordDataBase = require('../discorddatabase')
var enableEvent = (function(discordClient){
    discordClient.on('message', msg => {
        if (msg.toString().startsWith(config.prefix)) {
          commandHandler(msg.toString().substring(config.prefix),msg.channel,msg.author,discordClient)
        }
      });
})
module.exports = enableEvent;