const enableEvent = (discordClient) => {
  discordClient.on('interactionCreate', (interaction) => {
    if (!interaction.isSelectMenu()) return
    console.log(interaction)
  })
}
module.exports = enableEvent