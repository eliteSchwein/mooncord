const config = require('../../config.json');
const discordDatabase = require('../discorddatabase')
const https = require('https');
const axios = require('axios')
var FormData = require('form-data');
const fs = require('fs');
var enableEvent = (function(discordClient,websocketConnection){
    discordClient.on('message', msg => {
      if(msg.channel.type=="dm"){
        msg.author.send("DM is not Supportet!");
        return;
      }
      if(msg.channel.type!="text"){

        return;
      }
      if(msg.attachments.array().length==0){
          return;
      }
      if(!msg.attachments.array()[0].name.endsWith(".gcode")){
          return;
      }
      if(!isAdmin(msg.author,msg.guild)){
          return;
      }
      var database = discordDatabase.getGuildDatabase(msg.guild)
      var broadcastchannels = database.statuschannels
      for(var index in broadcastchannels){
          var channel = msg.guild.channels.cache.get(broadcastchannels[index]);
          if(channel==msg.channel.id){
            var gcodefile = msg.attachments.array()[0]
            var formData = new FormData();
            var tempFile = fs.createWriteStream("temp/"+gcodefile.name.replace(" ","_"));
            tempFile.on('finish', () => {
                console.log("upload "+gcodefile.name.replace(" ","_"))
                formData.append('file',fs.createReadStream("temp/"+gcodefile.name.replace(" ","_")),gcodefile.name)
                axios
                    .post(config.moonrakerapiurl + '/server/files/upload', formData,{
                        headers: formData.getHeaders()
                    })
                    .then(res => {
                        console.log(`uploaded `+gcodefile.name.replace(" ","_"))
                        msg.react("✅")
                        fs.unlink("temp/"+gcodefile.name.replace(" ","_"), (err) => {
                            if (err) {
                              console.error(err)
                              return
                            }
                          
                            //file removed
                          })
                    })
                    .catch(error => {
                        channel.send("<@"+config.masterid+"> Please Check the Console!")
                        console.log("Upload Failed! Check your config!")
                        fs.unlink("temp/"+gcodefile.name.replace(" ","_"), (err) => {
                            if (err) {
                              console.error(err)
                              return
                            }
                          
                            //file removed
                          })
                    })
                return;
            });
            const request = https.get(gcodefile.url,function(response) {
                response.pipe(tempFile);
            });
          }
      }
    });
    
})

function isAdmin(user,guild){
    var database = discordDatabase.getGuildDatabase(guild)
    var member = guild.member(user)
    if(user.id==config.masterid){
        return true
    }
    if(database.adminusers.includes(user.id)){
        return true
    }
    for(var memberole in member.roles.cache){
        if(database.adminroles.includes(memberole)){
            return true
        }
    }
    return false
}
module.exports = enableEvent;