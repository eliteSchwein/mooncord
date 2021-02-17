const config = require('../config.json');
const discordDatabase = require('../discorddatabase')
var fs = require('fs');
var enableEvent = (function(discordClient,websocketConnection){
    discordClient.on('message', msg => {
      if(msg.channel.type=="dm"){
        msg.author.send("DM is not Supportet!");
        return;
      }
      if(msg.channel.type!="text"){
        return;
      }
      if(msg.author.id!=discordClient.user.id){
        return
      }
      if(msg.embeds.length==0){
        return
      }
      var id = msg.embeds[0].title.toLowerCase().replace("/(\s)/g","")
      console.log(id)
      if (!fs.existsSync(__dirname+"/../discord-commandreactions/"+id+".js")) {
        return
      }
      const emoteModule = require("../discord-commandreactions/"+id)
      emoteModule(discordClient,websocketConnection,msg)
    })
})
module.exports = enableEvent;