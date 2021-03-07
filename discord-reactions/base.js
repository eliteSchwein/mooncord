const config = require('../config.json')
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
const executeReaction = function (message, user, guild, emote, discordClient, websocketConnection) {
  message.channel.send('You found the template Command Module GG')
}
module.exports = executeReaction
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
