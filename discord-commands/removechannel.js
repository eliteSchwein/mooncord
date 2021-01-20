const config = require('../../config.json');
const discordDatabase = require('../discorddatabase')
const command = "removechannel"
var executeCommand = (function(command,channel,user,guild,discordClient){
    var database = discordDatabase.getGuildDatabase(guild)
    if(!database.statuschannels.includes(channel.id)){
        channel.send("<@"+user.id+"> This Channel is not a Broadcast Channel!")
        return;
    }
    const index = database.statuschannels.indexOf(channel.id)
    if(index > -1){
        database.statuschannels.splice(index,1)
    }
    discordDatabase.updateDatabase(database,guild)
    channel.send("<@"+user.id+"> This Channel is no longer a Broadcast Channel!")
    
})
module.exports = executeCommand;
module.exports.getCommand = function(){return command}