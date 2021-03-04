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
    var disksfeedback = ""
    
    console.log(JSON.stringify(disks))
    for(var disk in disks){
        disksfeedback=disksfeedback.concat("**💾 DISK **("+disk.device+")\n")
        disksfeedback=disksfeedback.concat("`Type: "+disk.type+"`\n")
        disksfeedback=disksfeedback.concat("`Modell: "+disk.name+"`\n")
        disksfeedback=disksfeedback.concat("`Vendor: "+disk.vendor+"`\n")
        disksfeedback=disksfeedback.concat("`Size: "+(disk.size/(Math.pow(1024,3)))+"`\n")
        var partitionslist = ""
        var usage = 0
        for(var partition in partitions){
            if(String(partition.name).startsWith(disk.device)){
                partitionslist=partitionslist.concat(partition.mount+" ")
                usage=usage+partition.used
            }
        }
        disksfeedback=disksfeedback.concat("`Used: "+(usage/(Math.pow(1024,3)))+"`\n")
        disksfeedback=disksfeedback.concat("`Parititions: "+partitionslist+"`\n\n")
    }
    channel.send(cpufeedback+"\n\n"+ramfeedback+"\n\n"+disksfeedback)
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}