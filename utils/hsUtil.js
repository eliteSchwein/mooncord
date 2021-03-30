const Discord = require('discord.js')
const path = require('path')
const fs = require('fs')
const componentHandler = require('./hsComponents')

module.exports.getInformation = async function (component) {
  const img = getImage(component)
  const componentData = componentHandler[component]
  const fields = componentData.getFields()
  const embed = getDefaultEmbed(img[0], componentData.getTitle(), fields)
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
  for (let fieldindex in fields) {
    let field = fields[fieldindex]
    embed.addField(field.name, field.value, field.inline)
  }
  return embed
}
