const variables = require("../utils/variablesUtil")
const config = require('../config.json');

var event = ((connection,discordClient) => {
    connection.on('message', (message) => {
        let id = Math.floor(Math.random() * 10000) + 1;
        if (message.type === 'utf8') {
            var messageJson = JSON.parse(message.utf8Data)
            var methode = messageJson.method
            var result = messageJson.result
            if(typeof(result)!="undefined"){
                if(typeof(result.version_info)!="undefined"){
                    variables.setVersions(result.version_info)
                }
                if(typeof(result.status)!="undefined"){
                    var klipperstatus = result.status;
                    var currentProgress = 0
                    if(typeof(klipperstatus.virtual_sdcard)!="undefined"){
                        if (klipperstatus.virtual_sdcard.file_position <= printstartbyte){
                            currentProgress = 0
                            variables.setProgress(currentProgress)
                        }else if (klipperstatus.virtual_sdcard.file_position >= printendbyte){
                            currentProgress = 100
                            variables.setProgress(currentProgress)
                        }else{
                            let currentPosition = klipperstatus.virtual_sdcard.file_position - printstartbyte;
                            let maxPosition = printendbyte - printstartbyte;
                            if(currentPosition > 0 && maxPosition > 0){
                                currentProgress = (1/maxPosition*currentPosition)*100
                            }else{
                                currentProgress = klipperstatus.virtual_sdcard.progress
                            }
                            variables.setProgress(currentProgress)
                        }
                        if(variables.getStatus()=="printing"){
                            connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+variables.getCurrentFile()+'"}, "id": '+id+'}')
                            if(currentProgress.toFixed(0)!=0&&currentProgress.toFixed(0)!=100){
                                if(variables.getProgress()!=currentProgress.toFixed(0)){
                                    variables.setProgress(currentProgress)
                                    discordClient.user.setActivity("Printing: "+currentProgress.toFixed(0)+"%",{type: "WATCHING"})
                                    if(config.statusupdatepercent&&currentProgress.toFixed(2)!=0.00){
                                        if(currentProgress % config.statusupdateinterval === 0){
                                            variables.triggerStatusUpdate(discordClient)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })
})
module.exports = event;