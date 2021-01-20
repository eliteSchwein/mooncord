const config = require('../../config.json');
const discordDatabase = require('../discorddatabase')
const command = "addchannel"
var executeCommand = (function(command,channel,user,guild,discordClient){
    var database = discordDatabase.getGuildDatabase(guild)
    if(database.statuschannels.includes(channel.id)){
        channel.send("<@"+user.id+"> This Channel is already a Broadcast Channel!")
        return;
    }
    database.statuschannels.push(channel.id)
    discordDatabase.updateDatabase(database,guild)
    channel.send("<@"+user.id+"> This Channel is now a Broadcast Channel!")
    
})
module.exports = executeCommand;
module.exports.getCommand = function(){return command}