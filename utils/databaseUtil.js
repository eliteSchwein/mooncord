const databasepath = '../database.json'
const fs = require('fs')
const logSymbols = require('log-symbols')
const path = require('path')

module.exports = {}

function updateNotifyData(data) {
  const database = require(databasepath)
  database.notify = data
  saveDatabase(database)
}

function getNotifyData() {
  const database = require(databasepath)
  if (typeof (database.notify) === 'undefined') {
    updateNotifyData([])
    return []
  }
  return database.notify
}
function saveDatabase(databasedata) {
  fs.writeFile(path.resolve(__dirname, databasepath), JSON.stringify(databasedata), (err) => {
    if (err) { throw err }
    console.log(logSymbols.info, 'The Database has been saved!'.database)
  })
}
module.exports.updateNotify = function (user) {
  const notifylist = getNotifyData()
  if (notifylist.includes(user.id)) {
    const index = notifylist.indexOf(user.id)
    if (index > -1) {
      notifylist.splice(index, 1)
    }
    updateNotifyData(notifylist)
    return false
  }
  notifylist.push(user.id)
  updateNotifyData(notifylist)
  return true
}
module.exports.getNotifyList = function () {
  return getNotifyData()
}
module.exports.getGuildDatabase = function (guild) {
  const database = require(databasepath)
  if (typeof database.guilds[guild.id] === 'undefined') {
    console.log(logSymbols.info, `No Database for ${guild.name} found!\nGenerate base config!`.database)
    return {
      broadcastchannels: [],
      adminusers: [],
      adminroles: []
    }
  }
  return database.guilds[guild.id]
}
module.exports.getDatabase = function () {
  return require(databasepath)
}
module.exports.updateDatabase = function (data, guild) {
  const database = require(databasepath)
  database.guilds[guild.id] = data
  saveDatabase(database)
}
