const handlers = require('../buttons')

const enableEvent = (discordClient) => {
  discordClient.on('interactionCreate', (interaction) => {
    if (!interaction.isButton()) {return}
    handlers(interaction)
  })
}
module.exports = enableEvent