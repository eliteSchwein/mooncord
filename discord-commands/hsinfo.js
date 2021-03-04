const config = require('../config.json');
const discordDatabase = require('../discorddatabase')
const si = require('systeminformation');

const admin = false
const master = false
var executeCommand = (async function(command,channel,user,guild,discordClient,websocketConnection){
    const cpu = await si.cpu()
    const ram = await si.mem()
    const os = await si.osInfo()
    const load = await si.currentLoad()
    const disks = await si.diskLayout()
    const partitions = await si.fsSize()
    var cpufeedback = "**🧠 CPU:**\n"+
    "**"+cpu.physicalCores+" Cores | "+cpu.cores+" Threads**\n"+
    "**"+load.currentload+"% Usage**"
    channel.send(cpufeedback)
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}