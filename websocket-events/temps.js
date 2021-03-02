const variables = require("../utils/variablesUtil")

var event = ((connection,discordClient) => {
    connection.on('message', (message) => {
        let id = Math.floor(Math.random() * 10000) + 1;
        if (message.type === 'utf8') {
            var messageJson = JSON.parse(message.utf8Data)
            var methode = messageJson.method
            var result = messageJson.result
            if(typeof(result)!="undefined"){
                if(JSON.stringify(result).includes("temperature")){
                    variables.setTemps(result)
                }
            }
        }
    })
})
module.exports = event;