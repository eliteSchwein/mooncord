const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const https = require('https')
const logSymbols = require('log-symbols');

const config = require('../config.json')
const database = require('../utils/databaseUtil')
const permission = require('../utils/permissionUtil')

const enableEvent = function (discordClient) {
  discordClient.on('message', async (msg) => {
    if (msg.channel.type === 'dm') {
      msg.author.send('DM is not Supportet!')
      return
    }
    if (msg.channel.type !== 'text') {
      return
    }
    if (msg.attachments.array().length === 0) {
      return
    }
    if (!msg.attachments.array()[0].name.endsWith('.gcode')) {
      return
    }
    if (!await permission.hasAdmin(msg.author, msg.guild.id)) {
      return
    }
    const guilddatabase = database.getGuildDatabase(msg.guild)
    for (const index in broadcastchannels) {
      const channel = msg.guild.channels.cache.get(guilddatabase.broadcastchannels[index])
      if (channel === msg.channel.id) {
        const gcodefile = msg.attachments.array()[0]
        const formData = new FormData()
        const tempFile = fs.createWriteStream(`temp/${gcodefile.name.replace(' ', '_')}`)
        tempFile.on('finish', () => {
          console.log(logSymbols.info, `upload ${gcodefile.name.replace(' ', '_')}`.upload)
          formData.append('file', fs.createReadStream(`temp/${gcodefile.name.replace(' ', '_')}`), gcodefile.name)
          axios
            .post(`${config.moonrakerapiurl}/server/files/upload`, formData, {
              headers: formData.getHeaders()
            })
            .then(res => {
              console.log(logSymbols.success, `uploaded ${gcodefile.name.replace(' ', '_')}`.uploadsuccess)
              msg.react('✅')
              fs.unlink(`temp/${gcodefile.name.replace(' ', '_')}`, (err) => {
                if (err) {
                  console.log((err).error)
                }
              })
            })
            .catch(error => {
              if (error) {
                console.log((err).error)
                channel.send(`<@${config.masterid}> Please Check the Console!`)
                console.log(logSymbols.error, 'Upload Failed! Check your config!'.error)
                fs.unlink(`temp/${gcodefile.name.replace(' ', '_')}`, (err) => {
                  if (err) {
                    console.log((err).error)
                  }
                })
              }
            })
        })
        https.get(gcodefile.url, (response) => {
          response.pipe(tempFile)
        })
      }
    }
  })
}
module.exports = enableEvent
