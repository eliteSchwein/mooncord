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
    "`"+cpu.physicalCores+" Cores | "+cpu.cores+" Threads`\n"+
    "`"+load.currentload.toFixed(2)+"% Usage`"
    var ramfeedback = "**📟 RAM:**\n"+
    "`Total: "+(ram.total/(Math.pow(1024,3))).toFixed(2)+"GB `\n"+
    "`Used: "+(ram.used/(Math.pow(1024,3))).toFixed(2)+"GB `\n"
    channel.send(cpufeedback+"\n\n"+ramfeedback)
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}