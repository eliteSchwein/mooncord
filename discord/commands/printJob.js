const logSymbols = require('log-symbols')
const { SlashCommandBuilder } = require('@discordjs/builders')

const moonrakerClient = require('../../clients/moonrakerClient')
const chatUtil = require('../../utils/chatUtil')
const handlers = require('../../utils/handlerUtil')
const locale = require('../../utils/localeUtil')
const permission = require('../../utils/permissionUtil')
const statusUtil = require('../../utils/statusUtil')
const metaData = require('../commands-metadata/print_job.json')

const messageLocale = locale.commands.printjob
const syntaxLocale = locale.syntaxlocale.commands.printjob

let commandFeedback
let connection

let timeout = 0

module.exports.command = () => {
    const command = new SlashCommandBuilder()
        .setName(syntaxLocale.command)
        .setDescription(messageLocale.description)
        .addSubcommand(subCommand => 
            subCommand.setName(syntaxLocale.options.pause.name)
                .setDescription(messageLocale.options.pause.description)
        )
        .addSubcommand(subCommand => 
            subCommand.setName(syntaxLocale.options.cancel.name)
                .setDescription(messageLocale.options.cancel.description)
        )
        .addSubcommand(subCommand => 
            subCommand.setName(syntaxLocale.options.resume.name)
                .setDescription(messageLocale.options.resume.description)
        )
        .addSubcommand(subCommand => 
            subCommand.setName(syntaxLocale.options.start.name)
                .setDescription(messageLocale.options.start.description)
                .addStringOption(file =>
                    file.setName(syntaxLocale.options.start.options.file.name)
                        .setDescription(messageLocale.options.start.options.file.description)
                        .setRequired(true))
        )
    return command.toJSON()
}

module.exports.reply = async (interaction) => {
    try {
        if (!await permission.hasAdmin(interaction.user, interaction.guildId, interaction.client)) {
            await interaction.reply(locale.getAdminOnlyError(interaction.user.username))
            return
        }
        
        const subcommand = interaction.getSubcommand()
        const currentStatus = statusUtil.getStatus()
        const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1

        connection = moonrakerClient.getConnection()

        if (typeof (commandFeedback) !== 'undefined') {
            await interaction.reply(locale.getCommandNotReadyError(interaction.user.username))
            return
        }

        const key = getKeyByValue(syntaxLocale.options, subcommand)

        if (Object.keys(metaData).includes(key)) {
            const subcommandmeta = metaData[key]
            const lang_command_meta = messageLocale.answer[key]

            if (subcommand === currentStatus) {
                await message.reply(lang_command_meta.status_same.replace(/(\${username})/g, interaction.user.username))
                return
            }

            if (!subcommandmeta.requiredStatus.includes(currentStatus)) {
                await message.reply(lang_command_meta.status_not_valid.replace(/(\${username})/g, interaction.user.username))
                return
            }
            connection.send(`{"jsonrpc": "2.0", "method": "printer.gcode.script", "params": {"script": "${subcommandmeta.macro}"}, "id": ${id}}`)
            await message.reply(lang_command_meta.status_valid.replace(/(\${username})/g, interaction.user.username))
            return
        }
        
        if (subcommand === 'start') {
            await interaction.deferReply()

            startPrintJob(interaction, interaction.client)
        }

    } catch (error) {
        console.log(logSymbols.error, `Printjob Command: ${error}`.error)
        connection.removeListener('message', handler)
        commandFeedback = undefined
        await interaction.reply(locale.errors.command_failed)
    }
}

async function postStart(message, commandContext, discordClient) {
    const commandMessage = await commandContext.editReply(message)
    const currentMessage = commandFeedback
    
    commandFeedback = undefined

    if (typeof (message.embeds) === 'undefined') { return }
    
 //   const channel = await discordClient.getClient.channels.fetch(commandContext.channelID)
  //  const messageComponent = await channel.messages.fetch(commandMessage.id)
 //   const buttons = chatUtil.getButtons(metaData)

   // await messageComponent.edit({ embed: currentMessage, buttons: buttons })
}

function startPrintJob(commandContext, discordClient) {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    const gcodefile = commandContext.getString(syntaxLocale.options.start.options.file.name)
    timeout = 0
    connection.on('message', handler)
    connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${gcodefile}"}, "id": ${id}}`)

    const feedbackHandler = setInterval(() => {
        if (timeout === 6) {
            clearInterval(feedbackHandler)
            connection.removeListener('message', handler)
            postStart(
                locale.errors.command_timeout,
                commandContext,
                discordClient)
            return
        }

        timeout++

        if (typeof (commandFeedback) === 'undefined') {
            return
        }

        if (commandFeedback === 'Not Found!') {
            clearInterval(feedbackHandler)
            postStart(
                locale.errors.file_not_found,
                commandContext,
                discordClient)
            return
        }
        if (commandFeedback.files.length === 0) {
            return
        }
        clearInterval(feedbackHandler)
        postStart(
            commandFeedback,
            commandContext,
            discordClient)
    }, 500)
}

async function handler(message) {
    if (message.type !== 'utf8') { return }
    
    const messageJson = JSON.parse(message.utf8Data)

    if (typeof (messageJson.result) === 'undefined') { return }
    if (typeof (messageJson.result.filename) === 'undefined') { return }
    
    commandFeedback = await handlers.printFileHandler(message, messageLocale.embed.title, '#0099ff')
    connection.removeListener('message', handler)
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key].name === value);
}
