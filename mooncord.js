'use strict'
const systemInfo = require('systeminformation')
const colors = require('colors')

const discordClient = require('./clients/discordclient')
const moonrakerClient = require('./clients/moonrakerclient')

const hsUtil = require('./utils/hsUtil')

const pjson = require('./package.json')

colors.setTheme({
  database: 'grey',
  statustitle: 'cyan',
  statusmessage: 'brightCyan',
  successvalue: 'green',
  successname: 'brightGreen',
  success: 'brightGreen',
  startupinfo: 'grey',
  printstatus: 'cyan',
  error: 'brightRed'
});

systemInfo.osInfo().then(async data => {
  console.log(`\n
   __  __                     ${'____              _'.statustitle}
  |  \\/  | ___   ___  _ __   ${'/ ___|___  _ __ __| |'.statustitle}
  | |\\/| |/ _ \\ / _ \\| '_ \\ ${'| |   / _ \\| \'__/ _\` |'.statustitle}
  | |  | | (_) | (_) | | | |${'| |__| (_) | | | (_| |'.statustitle}
  |_|  |_|\\___/ \\___/|_| |_| ${'\\____\\___/|_|  \\__,_|'.statustitle}
                                                    
  Version: ${(pjson.version).statustitle}
  Author: ${(pjson.author).statustitle}
  Homepage: ${(pjson.homepage).statustitle}
  OS: ${(data.platform).statustitle}
  Distro: ${(data.distro).statustitle}
  Kernel: ${( data.kernel).statustitle}
  Arch: ${(data.arch).statustitle}`)
  const ram = await systemInfo.mem()

  if (ram.free <= 4194304) {
    console.log(
      `${
      '     _  _____ _____ _____ _   _ _____ ___ ___  _   _ \n' +
      '    / \\|_   _|_   _| ____| \\ | |_   _|_ _/ _ \\| \\ | |\n' +
      '   / _ \\ | |   | | |  _| |  \\| | | |  | | | | |  \\| |\n' +
      '  / ___ \\| |   | | | |___| |\\  | | |  | | |_| | |\\  |\n' +
      ' /_/   \\_\\_|   |_| |_____|_| \\_| |_| |___\\___/|_| \\_|\n' +
      '                                                  \n' +
      'There might be to few free memory! Mooncord need atleast 40MB RAM\n' +
      'Current free Ram: '.error}${(ram.used / (1024 ** 2)).toFixed(2)}MB`)
    process.exit(5)
  }

  await discordClient.init()

  await moonrakerClient.init()
  
  await hsUtil.init()
})