const variables = require('./variablesUtil')

const Discord = require('discord.js')
const fs = require('fs').promises
const path = require('path')

async function retrieveThumbnail () {
  const thumbnail = variables.getThumbnail()
  if (typeof (thumbnail) === 'undefined' || thumbnail === '') {
    return new Discord.MessageAttachment(await fs.readFile(path.resolve(__dirname, '../images/thumbnail_not_found.png')), 'thumbnail_not_found.png')
  }
  const buffer = Buffer.from(thumbnail, 'base64')
  return new Discord.MessageAttachment(buffer, 'thumbnail.png')
}

module.exports.retrieveThumbnail = async function () {
  return await retrieveThumbnail()
}
module.exports.buildThumbnail = async function (base64) {
  if (typeof (base64) === 'undefined' || base64 === '') {
    return new Discord.MessageAttachment(await fs.readFile(path.resolve(__dirname, '../images/thumbnail_not_found.png')), 'thumbnail_not_found.png')
  }
  const buffer = Buffer.from(base64, 'base64')
  return new Discord.MessageAttachment(buffer, 'thumbnail.png')
}
