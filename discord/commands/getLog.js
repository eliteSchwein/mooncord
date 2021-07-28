const args = process.argv.slice(2)

const axios = require("axios")
const logSymbols = require("log-symbols")
const { SlashCommand, CommandOptionType } = require("slash-create")

const config = require(`${args[0]}/mooncord.json`)
const discordClient = require("../../clients/discordClient")
const locale = require("../../utils/localeUtil")
const permission = require("../../utils/permissionUtil")
const metadata = require("../commands-metadata/get_log.json")

const messageLocale = locale.commands.get_log
const syntaxLocale = locale.syntaxlocale.commands.get_log

module.exports = class EditChannelCommand extends SlashCommand {
  constructor(creator) {
    console.log("  Load Get Log Command".commandload)
    super(creator, {
      name: syntaxLocale.command,
      description: messageLocale.description,
      options: [
        {
          choices: metadata.choices,
          type: CommandOptionType.STRING,
          name: syntaxLocale.options.log_file.name,
          description: messageLocale.options.log_file.description,
          required: true,
        },
      ],
    })
    this.filePath = __filename
  }

  async run(ctx) {
    if (!(await permission.hasController(ctx.user))) {
      return locale.getControllerOnlyError(ctx.user.username)
    }

    const service = ctx.options[syntaxLocale.options.log_file.name]

    ctx.defer(false)

    try {
      const result = await axios.request({
        responseType: "arraybuffer",
        url: `${config.connection.moonraker_url}${metadata.files[service]}`,
        method: "get",
        headers: {
          "Content-Type": "text/plain",
        },
      })

      await ctx.send({
        content: messageLocale.answer.retrieved.replace(
          /(\${service})/g,
          `\`${service}\``
        ),
        file: {
          name: `${service}.log`,
          file: result.data,
        },
      })
    } catch {
      await ctx.send(
        messageLocale.answer.not_found.replace(
          /(\${service})/g,
          `\`${service}\``
        )
      )
    }
  }

  onError(error, ctx) {
    console.log(logSymbols.error, `Get Log  Command: ${error}`.error)
    ctx.send(locale.errors.command_failed)
  }

  onUnload() {
    return "okay"
  }
}
