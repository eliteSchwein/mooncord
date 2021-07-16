const args = process.argv.slice(2)

const logSymbols = require('log-symbols')
const { SlashCommand } = require('slash-create')

const timelapseUtil = require('../../utils/timelapseUtil')

const config = require(`${args[0]}/mooncord.json`)

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        console.log('  Load Render Command'.commandload)
        let guildId
        if (!config.timelapse.enable) {
            guildId = '000000000000000000'
        }
        super(creator, {
            name: "render",
            description: "start Render",
            guildIDs: guildId
        })
    }

    async run(ctx) {
        ctx.defer(false)
        ctx.send("render now!")

        await timelapseUtil.render()
    }

    onError(error, ctx) {
        console.log(logSymbols.error, `Render Command: ${error}`.error)
    }

    onUnload() {
        return 'okay'
    }
}