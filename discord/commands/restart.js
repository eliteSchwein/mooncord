const Discord = require("discord.js")
const logSymbols = require("log-symbols")
const { SlashCommand, CommandOptionType } = require("slash-create")

const discordClient = require("../../clients/discordClient")
const moonrakerClient = require("../../clients/moonrakerClient")
const locale = require("../../utils/localeUtil")
const permission = require("../../utils/permissionUtil")

const messageLocale = locale.commands.restart
const syntaxLocale = locale.syntaxlocale.commands.restart

module.exports = class RestartCommand extends SlashCommand {
  constructor(creator) {
    console.log("  Load Restart Command".commandload)
    super(creator, {
      name: syntaxLocale.command,
      description: messageLocale.description,
      options: [
        {
          type: CommandOptionType.SUB_COMMAND,
          name: syntaxLocale.options.firmware.name,
          description: messageLocale.options.firmware.description,
        },
        {
          type: CommandOptionType.SUB_COMMAND,
          name: syntaxLocale.options.klipper.name,
          description: messageLocale.options.klipper.description,
        },
      ],
    })
    this.filePath = __filename
  }

  async run(ctx) {
    if (
      !(await permission.hasAdmin(
        ctx.user,
        ctx.guildID,
        discordClient.getClient()
      ))
    ) {
      return locale.getAdminOnlyError(ctx.user.username)
    }
    const subcommand = ctx.subcommands[0]

    const connection = moonrakerClient.getConnection()
    const id = Math.floor(Math.random() * Number.parseInt("10_000")) + 1

    ctx.defer(false)

    const handler = (message) => {
      console.log(message)
      connection.removeListener("message", handler)
    }

    switch (subcommand) {
      case "klipper": {
        connection.send(
          `{"jsonrpc": "2.0", "method": "printer.restart", "id": ${id}}`
        )
        break
      }

      case "firmware": {
        connection.send(
          `{"jsonrpc": "2.0", "method": "printer.firmware_restart", "id": ${id}}`
        )
        break
      }

      default: {
        // Some error occurred
        return
      }
    }

    connection.on("message", handler)

    const infoEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle(messageLocale.embed.title)

    ctx.defer(false)

    await ctx.send({
      embeds: [infoEmbed.toJSON()],
    })
  }

  onError(error, ctx) {
    console.log(logSymbols.error, `Restart Command: ${error}`.error)
    ctx.send(locale.errors.command_failed)
  }

  onUnload() {
    return "okay"
  }
}
