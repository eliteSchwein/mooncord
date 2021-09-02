const handlers = require('../buttons')

const enableEvent = (discordClient) => {
  discordClient.on('interactionCreate', (interaction) => {
    if (!interaction.isButton()) {return}

    const { message, client } = interaction

    if (message.author.id !== client.user.id) { return }

    handlers(interaction)
  })
}
module.exports = enableEvent