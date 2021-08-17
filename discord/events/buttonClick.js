const handlers = require('../buttons')

const enableEvent = (discordClient) => {
  discordClient.on('interactionCreate', (interaction) => {
    if (!interaction.isButton()) return
    console.log(interaction)
    //handlers(interaction, discordClient)
  })
}
module.exports = enableEvent