const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const https = require('https')
const logSymbols = require('log-symbols');

const config = require('../config.json')

const database = require('../utils/databaseUtil')
const permission = require('../utils/permissionUtil')

const { waitUntil } = require('async-wait-until')

let uploadList = []
let uploadWaitTimer = 0

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
    if (!await permission.hasAdmin(msg.author, msg.guild.id, discordClient)) {
      return
    }
    const guilddatabase = database.getGuildDatabase(msg.guild)
    for (const index in guilddatabase.broadcastchannels) {
      const channel = msg.guild.channels.cache.get(guilddatabase.broadcastchannels[index])
      if (channel.id === msg.channel.id) {
        const gcodefile = msg.attachments.array()[0]
        const uploadData = {
          'gcodefile': gcodefile,
          'message': msg
        }
        uploadList.push(uploadData)
        uploadWaitTimer = 5
        if (uploadWaitTimer === 0) {
          const timer = setInterval(async () => {
            console.log(uploadList)
            if (uploadWaitTimer === 0) {
              upload()
              clearInterval(timer)
            }
            uploadWaitTimer --
          }, 1000)
        }
      }
    }
  })
}
module.exports = enableEvent

async function upload() {
  if (uploadList.length === 0) {
    return
  }
  if (uploadWaitTimer !== 0) {
    return
  }
  await uploadFile(uploadList[0].gcodefile, uploadList[0].message)
  uploadList = uploadList.splice(0, 1)
  upload()
}

async function uploadFile(file, message) {
  const formData = new FormData()
  const tempFile = fs.createWriteStream(`temp/${file.name.replace(' ', '_')}`)
  const done = false
  tempFile.on('finish', () => {
    console.log(logSymbols.info, `upload ${file.name.replace(' ', '_')}`.upload)
    formData.append('file', fs.createReadStream(`temp/${file.name.replace(' ', '_')}`), file.name)
    axios
      .post(`${config.moonrakerurl}/server/files/upload`, formData, {
        headers: formData.getHeaders()
      })
      .then(res => {
        console.log(logSymbols.success, `uploaded ${file.name.replace(' ', '_')}`.uploadsuccess)
        message.react('✅')
        fs.unlink(`temp/${file.name.replace(' ', '_')}`, (err) => {
          if (err) {
            console.log((err).error)
          }
        })
        done = true
      })
      .catch(err => {
        if (err) {
          console.log((err).error)
          message.channel.send(`<@${config.masterid}> Please Check the Console!`)
          console.log(logSymbols.error, 'Upload Failed! Check your config!'.error)
          fs.unlink(`temp/${file.name.replace(' ', '_')}`, (err2) => {
            if (err2) {
              console.log((err2).error)
            }
          })
          done = true
        }
      })
  })
  https.get(file.url, (response) => {
    response.pipe(tempFile)
  })
  await waitUntil(() => done === true)
}
