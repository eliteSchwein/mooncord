const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const si = require('systeminformation')

const componentHandler = require('./hsComponents')

module.exports.getDefaultEmbed = (img, title) => {
  const image = getImage(img)
  const embed = getDefaultEmbed(image[0], title)
  return [image, embed]
}

module.exports.getInformation = async function (component) {
  const img = getImage(component)
  const componentData = componentHandler[component]
  const fields = await componentData.getFields()
  const embed = getDefaultEmbed(img[0], componentData.getTitle())
  if (fields.length > 0) {
    for (const fieldindex in fields) {
      const field = fields[fieldindex]
      embed.addField(field.name, field.value, field.inline)
    }
  } else {
    const description = locale.errors.no_data
      .replace(/(\${component})/g, componentData.getTitle())
    
    embed.setColor('#c90000')
    embed.setDescription(description)
  }
  return [img, embed]
}

module.exports.init = () => {
  setInterval(async () => {
    await si.currentLoad()
  }, 1000)
}

function getImage(component) {
        
  const imgPath = path.resolve(__dirname, `../images/${component}.png`)
  const imgBuffer = fs.readFileSync(imgPath)

  return [`${component}.png`, imgBuffer]
}

function getDefaultEmbed(img, title) {
  return new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(title)
    .setThumbnail(`attachment://${img}`)
}
