const upload = require('./upload')

const getModules = function (discordClient, websocketConnection) {
  upload(discordClient, websocketConnection)
}
module.exports = getModules