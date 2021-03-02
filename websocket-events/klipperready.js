const variables = require("../utils/variablesUtil")

var event = ((connection,discordClient) => {
    connection.on('message', (message) => {
        let id = Math.floor(Math.random() * 10000) + 1;
        if (message.type === 'utf8') {
            var messageJson = JSON.parse(message.utf8Data)
            var methode = messageJson.method
            var result = messageJson.result
            if(typeof(methode)!="undefined"){
                if(methode=="notify_klippy_ready"){
                    currentStatus="ready"
                    if(variables.getStatus()!=currentStatus){
                        variables.setStatus(currentStatus)
                        variables.triggerStatusUpdate(discordClient)
                    }
                }
            }
        }
    })
})
module.exports = event;