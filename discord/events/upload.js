const args = process.argv.slice(2)

const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const https = require('https')
const logSymbols = require('log-symbols')

const config = require(`${args[0]}/mooncord.json`)
const database = require('../../utils/databaseUtil')
const permission = require('../../utils/permissionUtil')

const uploadList = []
let uploadWaitTimer = 0
let uploadInProgress = false
let discordClient

const enableEvent = function (dcClient) {
  discordClient = dcClient
  discordClient.on('message', async (msg) => {
    if (msg.channel.type !== 'text' && msg.channel.type !== 'dm') {
      return
    }
    if (msg.attachments.array().length === 0) {
      return
    }
    if (!msg.attachments.array()[0].name.endsWith('.gcode')) {
      return
    }

    let guildid

    if (msg.guild !== null) {
      guildid = msg.guild.id

      const guilddatabase = database.getGuildDatabase(msg.guild)
      const broadcastchannels = guilddatabase.broadcastchannels
      
      if (!broadcastchannels.includes(msg.channel.id)) {
        return
      }
    }
    if (!await permission.hasAdmin(msg.author, guildid, discordClient)) {
      return
    }
    upload(msg)
  })
}
module.exports = enableEvent

function upload(message) {
  uploadList.push(message)
  if (uploadWaitTimer === 0) {
    uploadWaitTimer = 5
    const timer = setInterval(() => {
      if (uploadWaitTimer === 0) {
        uploadNext()
        clearInterval(timer)
      } else {
        uploadWaitTimer --
      }
    }, 1000)
  }
  uploadWaitTimer = 5
}

function uploadNext() {
  if (uploadList.length === 0) {
    return
  }
  if (uploadWaitTimer !== 0) {
    return
  }
  if (uploadInProgress) {
    return
  }
  uploadFile(uploadList[0])
  uploadList.splice(0, 1)
}

async function uploadFile(message) {
  const file = message.attachments.array()[0]
  const formData = new FormData()
  const tempFile = fs.createWriteStream(`temp/${file.name.replace(' ', '_')}`)
  const loadingReaction = await message.react('🔄')
  uploadInProgress = true
  tempFile.on('finish', () => {
    console.log(logSymbols.info, `upload ${file.name.replace(' ', '_')}`.upload)
    formData.append('file', fs.createReadStream(`temp/${file.name.replace(' ', '_')}`), file.name)
    axios
      .post(`${config.connection.moonraker_url}/server/files/upload`, formData, {
        headers: formData.getHeaders()
      })
      .then(async res => {
        console.log(logSymbols.success, `uploaded ${file.name.replace(' ', '_')}`.uploadsuccess)
        loadingReaction.users.remove(discordClient.client.user)
        message.react('✅')
        fs.unlink(`temp/${file.name.replace(' ', '_')}`, (error) => {
          if (error) {
            console.log(logSymbols.error, `Upload Event: ${error}`.error)
          }
        })
        uploadInProgress = false
        setTimeout(uploadNext, 250)
      })
      .catch(error => {
        if (error) {
            console.log(logSymbols.error, `Upload Event: ${error}`.error)
          message.channel.send('Please Check the Console!')
          console.log(logSymbols.error, 'Upload Failed! Check your config!'.error)
          fs.unlink(`temp/${file.name.replace(' ', '_')}`, (error2) => {
            if (error2) {
            console.log(logSymbols.error, `Upload Event: ${error2}`.error)
            }
          })
          uploadInProgress = false
        setTimeout(uploadNext, 250)
        }
      })
  })
  https.get(file.url, (response) => {
    response.pipe(tempFile)
  })
}
