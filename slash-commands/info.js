const { SlashCommand, Message } = require('slash-create');
const Discord = require('discord.js')
const pjson = require('../package.json')
const path = require('path')
const core = require('../mooncord')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'info',
            description: 'Send a Description about me.'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        const description = `Version: ${pjson.version}\n
            Author: ${pjson.author}\n
            Homepage: ${pjson.homepage}\n`

        const infoEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Informations')
            .setDescription(description)
            .setTimestamp()
            .setFooter(`${ctx.user.username} # ${ctx.user.discriminator}`, user.avatarURL())
        
        const answer = new Message
            .embeds([infoEmbed])
        console.log(answer)

        return "NONE";
    }
}