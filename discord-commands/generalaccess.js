const config = require('../config.json');
const admin = false
const master = true
const discordDatabase = require('../discorddatabase')
var executeCommand = (function(command,channel,user,guild,discordClient,websocketClient){
    var database = discordDatabase.getGuildDatabase(guild)
    if(database.accesseveryone){
        database.accesseveryone=false
        discordDatabase.updateDatabase(database,guild)
        channel.send("<@"+user.id+"> You disabled the Access for everyone!")
        return;
    }
    database.accesseveryone=true
    discordDatabase.updateDatabase(database,guild)
    channel.send("<@"+user.id+"> You enabled the Access for everyone!")
    return;
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}