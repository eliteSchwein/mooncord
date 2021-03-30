const si = require('systeminformation')
const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')

module.exports.default = async function (component) {
  if (component === 'cpu') return await this.getCPU()
}

module.exports.getCPU = async function () {

  const img = getImage('cpu')
  const fields = [{
    name: 'test',
    value: 'test2',
    inline: true
  }]
  const embed = getDefaultEmbed(img[0],'CPU',fields)
  return [img, embed]
}


function getImage(component) {
        
  const imgPath = path.resolve(__dirname, `../images/${component}.png`)
  const imgBuffer = fs.readFileSync(imgPath)

  return [`${component}.png`, imgBuffer]
}

function getDefaultEmbed(img,title,fields) {
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setThumbnail(`attachment://${img}`)
  for (let field in fields) {
    embed.addField(field.name, field.value, field.inline)
  }
  return embed
}
