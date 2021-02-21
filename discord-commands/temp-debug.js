const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
var variables = require("../websocketevents")
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var debug = ""
    var temps = variables.getTemps()
    for(var temp in temps){
        if(temp.includes("temperature_sensor")){
            debug=debug.concat("**🌡"+temp.replace("temperature_sensor ","")+":**\n`"+temps[temp].temperatures[temps[temp].temperatures.length-1]+"°C`\n\n")
        }else if(temp.includes("extruder")||temp.includes("heater_bed")){
            debug=debug.concat("**♨"+temp+":**\n`Current:"+temps[temp].temperatures[temps[temp].temperatures.length-1]+"°C` `Target:"+temps[temp].targets[temps[temp].targets.length-1]+"°C` `Power:"+calculatePercent(temps[temp].powers[temps[temp].powers.length-1])+"%`\n\n")
        }else if(temp.includes("temperature_fan")){
            debug=debug.concat("**❄"+temp+"**:\n`Current:"+temps[temp].temperatures[temps[temp].temperatures.length-1]+"°C` `Target:"+temps[temp].targets[temps[temp].targets.length-1]+"°C` `Speed:"+calculatePercent(temps[temp].speeds[temps[temp].speeds.length-1])+"`\n\n")
        }
    }
    console.log(temps)
    channel.send(debug)
})
function calculatePercent(input){
    var percent = 100*input
    return percent.toFixed(0)
}
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}