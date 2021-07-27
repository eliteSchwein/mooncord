module.exports = async (button, discordClient) => {
    const message = button.message
    if (message.author.id !== discordClient.user.id) { return }
    console.log(button)
}