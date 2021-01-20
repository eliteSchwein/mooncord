const config = require('../../config.json');
const discordDataBase = require('../discorddatabase')
const command = "addchannel"
const admin = true;
var executeCommand = (function(command,channel,user,guild,discordClient){
    channel.send(guild.id)
    discordDataBase.getDatabase(guild)
    
})
module.exports = executeCommand;
module.exports.getCommand = function(){return command}
module.exports.isAdmin = function(){return admin}