const { SlashCommand } = require('slash-create');
const Discord = require('discord.js')
const pjson = require('../package.json')
const path = require('path')

module.exports = class HelloCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: 'test-1',
            description: 'Says hello to you.'
        });
        this.filePath = __filename;
    }

    async run(ctx) {
        const description = `${'' +
            'Version: '}${pjson.version}\n` +
            `Author: ${pjson.author}\n` +
            `Homepage: ${pjson.homepage}\n`

        const infoEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Informations')
            .setAuthor(discordClient.user.tag, discordClient.user.avatarURL())
            .setDescription(description)
            .attachFiles(path.resolve(__dirname, '../images/logo.png'))
            .setThumbnail('attachment://logo.png')
            .setTimestamp()
            .setFooter(`${ctx.user.username} # ${ctx.user.discriminator}`, user.avatarURL())

        return infoEmbed;
    }
}