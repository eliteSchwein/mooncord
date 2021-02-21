const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
var variables = require("../websocketevents")
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    var debug = "DEV COMMAND!\n"
    var temps = variables.getTemps()
    for(var temp in temps){
        if(temp.includes("temperature_sensor")){
            debug.concat("🌡"+temp.replace("temperature_sensor ","")+"\n`"+temps[temp].temperature[0]+"°C`\n")
        }else if(temp.includes("extruder")||temp.includes("heater_bed")){
            debug.concat("♨"+temp+"\n`"+temps[temp].temperature[0]+"/"+temps[temp].targets[0]+"°C` `"+temps[temp].powers[0]+"%`\n")
        }else if(temp.includes("temperature_fan")){
            debug.concat("❄"+temp+"\n`"+temps[temp].temperature[0]+"/"+temps[temp].targets[0]+"°C` `"+temps[temp].speeds[0]+"`\n")
        }
    }
    console.log(temps)
    channel.send(debug)
})
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}