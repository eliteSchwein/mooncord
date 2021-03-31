const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const https = require('https')

const config = require('../config.json')
const { database } = require('../utils')
let { discordClient } = require('../clients')

const enableEvent = function () {
  discordClient.getClient().on('message', msg => {
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
    if (!isAdmin(msg.author, msg.guild)) {
      return
    }
    const guilddatabase = database.getGuildDatabase(msg.guild)
    const broadcastchannels = guilddatabase.statuschannels
    for (const index in broadcastchannels) {
      const channel = msg.guild.channels.cache.get(broadcastchannels[index])
      if (channel === msg.channel.id) {
        const gcodefile = msg.attachments.array()[0]
        const formData = new FormData()
        const tempFile = fs.createWriteStream(`temp/${gcodefile.name.replace(' ', '_')}`)
        tempFile.on('finish', () => {
          console.log(`upload ${gcodefile.name.replace(' ', '_')}`)
          formData.append('file', fs.createReadStream(`temp/${gcodefile.name.replace(' ', '_')}`), gcodefile.name)
          axios
            .post(`${config.moonrakerapiurl}/server/files/upload`, formData, {
              headers: formData.getHeaders()
            })
            .then(res => {
              console.log(`uploaded ${gcodefile.name.replace(' ', '_')}`)
              msg.react('✅')
              fs.unlink(`temp/${gcodefile.name.replace(' ', '_')}`, (err) => {
                if (err) {
                  console.error(err)
                }
              })
            })
            .catch(error => {
              if (error) {
                console.log(error)
                channel.send(`<@${config.masterid}> Please Check the Console!`)
                console.log('Upload Failed! Check your config!')
                fs.unlink(`temp/${gcodefile.name.replace(' ', '_')}`, (err) => {
                  if (err) {
                    console.error(err)
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

function isAdmin (user, guild) {
  const guilddatabase = database.getGuildDatabase(guild)
  const member = guild.member(user)
  if (user.id === config.masterid) {
    return true
  }
  if (guilddatabase.adminusers.includes(user.id)) {
    return true
  }
  for (const memberole in member.roles.cache) {
    if (guilddatabase.adminroles.includes(memberole)) {
      return true
    }
  }
  return false
}
module.exports = enableEvent
