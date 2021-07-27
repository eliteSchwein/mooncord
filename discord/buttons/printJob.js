const metaData = require('../buttons-metadata/print_job.json')

module.exports = async (button, discordClient) => {
    const message = button.message
    if (message.author.id !== discordClient.user.id) { return }
    if (!Object.keys(metaData).includes(button.id)) { return }
    console.log(button)
}