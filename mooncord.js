'use strict'
const args = process.argv.slice(2)

const config = require(`${args[0]}/mooncord.json`)
const colors = require('colors')
const systemInfo = require('systeminformation')

const discordClient = require('./clients/discordClient')
const moonrakerClient = require('./clients/moonrakerClient')
const pjson = require('./package.json')
const loadUtil = require('./utils/loadUtil')
const migrationUtil = require('./utils/migrationUtil')
const miscUtil = require('./utils/miscUtil')
const timelapseUtil = require('./utils/timelapseUtil')

colors.setTheme({
  database: 'grey',
  commandload: 'grey',
  upload: 'grey',
  uploadsuccess: 'green',
  statustitle: 'cyan',
  throttlewarn: 'yellow',
  statusmessage: 'brightCyan',
  successvalue: 'green',
  successname: 'brightGreen',
  success: 'brightGreen',
  printstatus: 'white',
  error: 'brightRed'
})

systemInfo.osInfo()
  .then(async data => {
    console.log(`\n
     __  __                     ${'____              _'.statustitle}
    |  \\/  | ___   ___  _ __   ${'/ ___|___  _ __ __| |'.statustitle}
    | |\\/| |/ _ \\ / _ \\| '_ \\ ${'| |   / _ \\| \'__/ _\` |'.statustitle}
    | |  | | (_) | (_) | | | |${'| |__| (_) | | | (_| |'.statustitle}
    |_|  |_|\\___/ \\___/|_| |_| ${'\\____\\___/|_|  \\__,_|'.statustitle}
                                                      
    Version: ${(pjson.version).statustitle}
    Configpath: ${args[0].statustitle}
    Locale: ${(config.language.messages).statustitle}
    Author: ${(pjson.author).statustitle}
    Homepage: ${(pjson.homepage).statustitle}
    OS: ${(data.platform).statustitle}
    Distro: ${(data.distro).statustitle}
    Kernel: ${( data.kernel).statustitle}
    Arch: ${(data.arch).statustitle}`)
    const ram = await systemInfo.mem()

    if (ram.free <= Number.parseInt('4_194_304')) {
      console.log(
        `${
        `${'     _  _____ _____ _____ _   _ _____ ___ ___  _   _ \n' +
        '    / \\|_   _|_   _| ____| \\ | |_   _|_ _/ _ \\| \\ | |\n' +
        '   / _ \\ | |   | | |  _| |  \\| | | |  | | | | |  \\| |\n' +
        '  / ___ \\| |   | | | |___| |\\  | | |  | | |_| | |\\  |\n' +
        ' /_/   \\_\\_|   |_| |_____|_| \\_| |_| |___\\___/|_| \\_|\n' +
        '                                                  \n' +
        'There might be to few free memory! Mooncord need atleast 40MB RAM\n'}${ 
        'Current free Ram: '.error}`}${(ram.used / (1024 ** 2)).toFixed(2)}MB`)
      process.exit(5)
    }

    await migrationUtil.migrate()

    await moonrakerClient.init(discordClient,
      config.connection.moonraker_socket_url,
      config.connection.moonraker_url,
      config.connection.moonraker_token)
    
    await loadUtil.init(discordClient.getClient)
    
    miscUtil.init()
    
    if (config.timelapse.enable) {
      timelapseUtil.init(discordClient, moonrakerClient)
    }

    await discordClient.init(config.connection.bot_token,
      config.connection.bot_application_id,
      config.connection.bot_application_key)
  })
  .catch(error => {
    console.log('Mooncord couldnt start'.error)
    console.log(`Reason: ${error}`.error)
})