const WebSocketClient = require('websocket').client
const { waitUntil } = require('async-wait-until')
const axios = require('axios')
const FormData = require('form-data')
const logSymbols = require('log-symbols')

const database = require('../utils/databaseUtil')
const status = require('../utils/statusUtil')
const variables = require('../utils/variablesUtil')
const events = require('../websocket-events')

const client = new WebSocketClient()

let wsUrl
let url
let token
let oneShotToken

let WSconnection

async function enableEvents(discordClient) {
  console.log('  Enable Moonraker Events'.statusmessage)

  client.on('connect', async (connection) => {
    const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
    console.log('  Moonraker Client Connected'.success)

    WSconnection = connection
    
    console.log('  Sent initial Moonraker commands'.statusmessage)

    connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.list", "id": ${id}}`)
    
    connection.on('message', handleSubscription)

    //connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "false"}, "id": ${id}}`)
    //connection.send(`{"jsonrpc": "2.0", "method": "printer.info", "id": ${id}}`)
    //connection.send(`{"jsonrpc": "2.0", "method": "server.info", "id": ${id}}`)
    //connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"configfile": null }}, "id": ${id}}`)

    console.log('  Initial Automatic Moonraker commands'.statusmessage)

    setInterval(() => {
      const mculist = getMCUList()
    //connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.list", "id": ${id}}`)
     // connection.send(`{"jsonrpc": "2.0", "method": "machine.update.status", "params": {"refresh": "false"}, "id": ${id}}`)
     // connection.send(`{"jsonrpc": "2.0", "method": "machine.proc_stats", "id": ${id}}`)
     // connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null, "gcode_move": null, "system_stats": null, "display_status": null }}, "id": ${id}}`)
     // connection.send(`{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": ${JSON.stringify(mculist)}}, "id": ${id}}`)
      
      //if(variables.getCurrentPrintJob() !== '')
       // {connection.send(`{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "${variables.getCurrentPrintJob()}"}, "id": ${id}}`)}
    }, 250)

    connection.on('close', () => {
      console.log('  WebSocket Connection Closed'.error)
      console.log('  Reconnect in 5 sec'.error)
      status.changeStatus(discordClient.getClient, 'offline')
      setTimeout(() => {
        client.connect(`${wsUrl}?token=${oneShotToken}`)
      }, 5000)
    })
    connection.on('message', (message) => {
      for (const event in events) {
        events[event](message, connection, discordClient.getClient, database)
      }
    })
  })
}


function getMCUList() {
  const rawmculist = variables.getMCUList()
  const mculist = {}
  Object.keys(rawmculist).forEach(key => {
    mculist[key] = null
  })
  return mculist
}

function connect(discordClient) {
  console.log('  Connect to Moonraker'.statusmessage)
  
  client.connect(`${wsUrl}?token=${oneShotToken}`)

  client.on('connectFailed', (error) => {
    console.log(logSymbols.error, `Moonrakerclient: ${error}`.error)
    status.changeStatus(discordClient.getClient, 'offline')
    console.log('  Please check your Config!'.error)
    setTimeout(() => {
      process.exit(5)
    }, 2000)
  })
}

async function getOneShotToken() {
  if (token === '') { return '' }
  console.log('  Get Oneshot Token'.statusmessage)

  const tempToken = await axios
      .get(`${url}/access/oneshot_token`, {
        headers: {
          'X-Api-Key': token
        }
      })
  
  return tempToken.data.result
}

function handleSubscription(message) {
  if (message.type !== 'utf8') { return }
  
  const id = Math.floor(Math.random() * Number.parseInt('10_000')) + 1
  
  const messageJson = JSON.parse(message.utf8Data)

  if (typeof (messageJson.result) === 'undefined') { return }
  if (typeof (messageJson.result.objects) === 'undefined') { return }

  const objects = {}

  for (const object in messageJson.result.objects) {
    console.log(object)
  }

  WSconnection.send(`{"jsonrpc": "2.0", "method": "printer.objects.subscribe", "params": { "objects":${JSON.stringify(messageJson.result.objects)}}}, "id": ${id}}`)
  WSconnection.removeListener('message', handleSubscription)
}

module.exports = {}
module.exports.init = async (discordClient, moonrakerWSUrl, moonrakerUrl, moonrakerToken) => {
  token = moonrakerToken
  wsUrl = moonrakerWSUrl
  url = moonrakerUrl
  console.log(`\n
  ${
  ` __  __                        _           
  |  \\/  |___  ___ _ _  _ _ __ _| |_____ _ _ 
  | |\\/| / _ \\/ _ \\ ' \\| '_/ _\` | / / -_) '_|
  |_|  |_\\___/\\___/_||_|_| \\__,_|_\\_\\___|_|`.statustitle}
                              `)
  oneShotToken = await getOneShotToken()
  connect(discordClient)
  enableEvents(discordClient)
  await waitUntil(() => typeof(WSconnection) !== 'undefined', { timeout: Number.POSITIVE_INFINITY })
  await waitUntil(() => WSconnection.connected === true, { timeout: Number.POSITIVE_INFINITY })
}
module.exports.getConnection = () => { return WSconnection }
module.exports.getClient = () => { return client }
module.exports.getOneShotToken = async () => { return await getOneShotToken() }
