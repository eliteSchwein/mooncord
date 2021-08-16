const logSymbols = require('log-symbols')
const { SlashCommandBuilder } = require('@discordjs/builders')

const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')

const metaData = require('../commands-metadata/list_files.json')

const messageLocale = locale.commands.listfiles
const syntaxLocale = locale.syntaxlocale.commands.listfiles

let commandFeedback
let connection

let lastid = 0
let timeout = 0

module.exports.command = () => {
    console.log('  Load List Files Command'.commandload)
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        if (!await permission.hasAdmin(interaction.user, interaction.guildId, interaction.client)) {
            await interaction.reply(locale.getAdminOnlyError(interaction.user.username))
            return
        }
        if (typeof (commandFeedback) !== 'undefined') {
            await interaction.reply(locale.getCommandNotReadyError(interaction.user.username))
            return
        }
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
        connection = moonrakerClient.getConnection()

        connection.on('message', handler)
        connection.send(`{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": ${id}}`)

        commandFeedback = undefined
        
        await interaction.deferReply()

        const feedbackInterval = setInterval(async () => {
            if (typeof (commandFeedback) !== 'undefined') {
                if(lastid === id) { return }
                lastid = id
                
                //const buttons = chatUtil.getButtons(metaData)
                
                await interaction.editReply(commandFeedback)
                
                commandFeedback = undefined
                lastid = 0
                clearInterval(feedbackInterval)
            }
            if (timeout === 10) {
                await interaction.editReply(locale.errors.no_files_found)

                commandFeedback = undefined
                connection.removeListener('message', handler)
                clearInterval(feedbackInterval)
            }
            timeout++
        }, 500)
    } catch (error) {
        console.log(logSymbols.error, `List Files Command: ${error}`.error)
        connection.removeListener('message', handler)
        commandFeedback = undefined
        await interaction.editReply(locale.errors.command_failed)
    }
}

async function handler (message) {
    const messageJson = JSON.parse(message.utf8Data)
    if(/(modified)/g.test(JSON.stringify(messageJson))) {
        connection.removeListener('message', handler)
        commandFeedback = await chatUtil.generatePageEmbed(
            false,
            1,
            messageJson.result,
            messageLocale.embed.title,
            'printlist.png')
    }
}