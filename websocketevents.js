const fs = require('fs')
const path = require('path')
const si = require('systeminformation')

const variables = require('./utils/variablesUtil')

const getModule = async function (client, discordClient) {
  client.on('connect', async (connection) => {
    const id = Math.floor(Math.random() * 10_000) + 1
    fs.readdir(path.resolve(__dirname, 'websocket-events'), (err, files) => {
      if (err) {
        console.log(err)
        return
      }
      connection.on('message', (message) => {
        files.forEach(file => {
          delete require.cache[require.resolve(`./websocket-events/${  file}`)]
          const event = require(`./websocket-events/${  file}`)
          event(message, connection, discordClient)
        })
      })
    })
    setTimeout(async () => {
      setInterval(async () => {
        connection.send(`{"jsonrpc": "2.0", "method": "server.temperature_store", "id": ${  id  }}`)
        connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": ${  id  }}`)
        await si.currentLoad()
      }, 1000)
      setInterval(async () => {
        connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "true"}, "id": ${  id  }}`)
      }, 60_000)
      connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${  id  }}`)
      connection.send(`{"jsonrpc": "2.0", "method": "printer.info", "id": ${  id  }}`)
      connection.send(`{"jsonrpc": "2.0", "method": "server.info", "id": ${  id  }}`)
      connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${  variables.getCurrentFile()  }"}, "id": ${  id  }}`)
    }, 250)
  })
}
module.exports = getModule
