'use strict'
const systemInfo = require('systeminformation')

const discordClient = require('./clients/discordclient')
const moonrakerClient = require('./clients/moonrakerclient')

const hsUtil = require('./utils/hsUtil')

const pjson = require('./package.json')

systemInfo.osInfo().then(async data => {
  console.log(`${'\n' +
    '    __  __                    ____              _ \n' +
    '   |  \\/  | ___   ___  _ __  / ___|___  _ __ __| |\n' +
    "   | |\\/| |/ _ \\ / _ \\| '_ \\| |   / _ \\| '__/ _` |\n" +
    '   | |  | | (_) | (_) | | | | |__| (_) | | | (_| |\n' +
    '   |_|  |_|\\___/ \\___/|_| |_|\\____\\___/|_|  \\__,_|\n' +
    '                                                  \n' +
    'Version: '}${pjson.version}\n` +
    `Author: ${pjson.author}\n` +
    `Homepage: ${pjson.homepage}\n` +
    `OS: ${data.platform}\n` +
    `Distro: ${data.distro}\n` +
    `Kernel: ${data.kernel}\n` +
    `Arch: ${data.arch}`)
  const ram = await systemInfo.mem()

  if (ram.free <= 4194304) {
    console.log(
      `${'     _  _____ _____ _____ _   _ _____ ___ ___  _   _ \n' +
      '    / \\|_   _|_   _| ____| \\ | |_   _|_ _/ _ \\| \\ | |\n' +
      '   / _ \\ | |   | | |  _| |  \\| | | |  | | | | |  \\| |\n' +
      '  / ___ \\| |   | | | |___| |\\  | | |  | | |_| | |\\  |\n' +
      ' /_/   \\_\\_|   |_| |_____|_| \\_| |_| |___\\___/|_| \\_|\n' +
      '                                                  \n' +
      'There might be to few free memory! Mooncord need atleast 40MB RAM\n' +
      'Current free Ram: '}${(ram.used / (1024 ** 2)).toFixed(2)}MB`)
    process.exit(5)
  }

  await discordClient.init()

  await moonrakerClient.init()
  
  await hsUtil.init()
})
module.exports.getDiscordClient = function () {
  return discordClient.getClient()
}
