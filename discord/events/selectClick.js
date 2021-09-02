const handlers = require('../selection')

const enableEvent = (discordClient) => {
  discordClient.on('interactionCreate', (interaction) => {
    if (!interaction.isSelectMenu()) {return}
    handlers(interaction)
  })
}
module.exports = enableEvent