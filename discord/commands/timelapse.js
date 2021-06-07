const { SlashCommand } = require('slash-create')
const Discord = require('discord.js')
const config = require(`${args[0]}/mooncord.json`)

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'timelapse',
            description: 'Get the latest Timelapse.'
        })
        this.filePath = __filename
    }

    async run(ctx) {
        try {
            
        }
        catch (error) {
            console.log((error).error)
            return "An Error occured!"
        }
    }
}