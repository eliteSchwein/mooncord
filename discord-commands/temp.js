const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
var variables = require("../websocketevents")
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var feedback = ""
    var temps = variables.getTemps()
    for(var temp in temps){
        if(temp.includes("temperature_sensor")){
            feedback=feedback.concat("**🌡"+temp.replace("temperature_sensor ","")+":**\n`"+temps[temp].temperatures[0]+"°C`\n\n")
        }else if(temp.includes("extruder")||temp.includes("heater_bed")){
            feedback=feedback.concat("**♨"+temp+":**\n`Current:"+temps[temp].temperatures[0]+"°C` `Target:"+temps[temp].targets[0]+"°C` `Power:"+temps[temp].powers[0]+"%`\n\n")
        }else if(temp.includes("temperature_fan")){
            feedback=feedback.concat("**❄"+temp+"**:\n`Current:"+temps[temp].temperatures[0]+"°C` `Target:"+temps[temp].targets[0]+"°C` `Speed:"+temps[temp].speeds[0]+"`\n\n")
        }
    }
    channel.send(feedback)
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}