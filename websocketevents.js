const fs = require('fs')
const path = require('path')
const variables = require('./utils/variablesUtil')
const si = require('systeminformation')

const getModule = async function (client, discordClient) {
  client.on('connect', async function (connection) {
    const id = Math.floor(Math.random() * 10000) + 1
    fs.readdir(path.resolve(__dirname, 'websocket-events'), (err, files) => {
      if (err) {
        console.log(err)
        return
      }
      files.forEach(file => {
        delete require.cache[require.resolve('./websocket-events/' + file)]
        const event = require('./websocket-events/' + file)
        event(connection, discordClient)
      })
    })
    setTimeout(async function () {
      setInterval(async function () {
        connection.send('{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ' + id + '}')
        connection.send('{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": ' + id + '}')
        await si.currentLoad()
      }, 1000)
      setInterval(async function () {
        connection.send('{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "true"}, "id": ' + id + '}')
      }, 3600000 * 3)
      connection.send('{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ' + id + '}')
      connection.send('{"jsonrpc": "2.0", "method": "printer.info", "id": ' + id + '}')
      connection.send('{"jsonrpc": "2.0", "method": "server.info", "id": ' + id + '}')
      connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "' + variables.getCurrentFile() + '"}, "id": ' + id + '}')
    }, 250)
  })
}
module.exports = getModule
