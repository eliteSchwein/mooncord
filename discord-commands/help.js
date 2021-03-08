const admin = false
const master = false
const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')

let commands = ''
const executeCommand = function (command, channel, user, guild, discordClient, websocketConnection) {
  channel.startTyping()
  commands = ''
  fs.readdir(path.resolve(__dirname), (err, files) => {
    files.forEach(file => {
      if (err) {
        console.log(err)
      } else {
        commands = commands.concat(` \`${  file.replace('.js', '')  }\``)
      }
    })
  })
  setTimeout(() => {
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Help')
      .setThumbnail(discordClient.user.avatarURL())
      .setDescription(`Aviable Commands:\n${  commands}`)
      .setTimestamp()
      .setFooter(user.tag, user.avatarURL())
    channel.stopTyping()
    channel.send(embed)
  }, 2000)
}
module.exports = executeCommand
module.exports.needAdmin = function () { return admin }
module.exports.needMaster = function () { return master }
