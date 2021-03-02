const variables = require("../utils/variablesUtil")
const config = require('../config.json');

var event = ((connection,discordClient) => {
    connection.on('message', (message) => {
        let id = Math.floor(Math.random() * 10000) + 1;
        if (message.type === 'utf8') {
            var messageJson = JSON.parse(message.utf8Data)
            var methode = messageJson.method
            var result = messageJson.result
            var timer
            if(methode=="notify_gcode_response"){
                var params = messageJson.params
                if(params[0].startsWith("File opened")){
                    var removeSize = params[0].substring(0,params[0].indexOf(" Size"))
                    var removeFileTag = removeSize.substring(12)
                    printfile=removeFileTag;
                    connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+printfile+'"}, "id": '+id+'}')
                    currentStatus="start"
                    if(variables.getStatus()!=currentStatus){
                        variables.setStatus(currentStatus)
                        variables.triggerStatusUpdate(discordClient)
                    }
                    variables.setStatus("printing")
                    if(!config.statusupdatepercent){
                        timer=setInterval(function(){
                            variables.triggerStatusUpdate(discordClient)
                        },1000*config.statusupdateinterval)
                        variables.setUpdateTimer(timer)
                    }
                }
                if(params[0]=="// action:cancel"){
                    currentStatus="stop"
                    if(variables.getStatus()!=currentStatus){
                        variables.setStatus(currentStatus)
                        variables.triggerStatusUpdate(discordClient)
                        clearInterval(variables.getUpdateTimer())
                    }
                    setTimeout(function(){
                        variables.setStatus("ready")
                        variables.triggerStatusUpdate(discordClient)
                    },2000)
                }
            }
        }
    })
})
module.exports = event;