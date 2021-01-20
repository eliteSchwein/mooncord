const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
var executeCommand = (function(command,channel,user,guild,discordClient){
    channel.send("You found the template Command Module GG")
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}