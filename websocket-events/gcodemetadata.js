const variables = require("../utils/variablesUtil")

var event = ((connection,discordClient) => {
    connection.on('message', (message) => {
        let id = Math.floor(Math.random() * 10000) + 1;
        if (message.type === 'utf8') {
            var messageJson = JSON.parse(message.utf8Data)
            var methode = messageJson.method
            var result = messageJson.result
            if(typeof(result.thumbnails)!="undefined"){
                variables.setThumbnail(result.thumbnails[1].data)
            }
            if(typeof(result.gcode_start_byte)!="undefined"){
                variables.setStartByte(result.gcode_start_byte)
            }
            if(typeof(result.gcode_end_byte)!="undefined"){
                variables.setEndByte(result.gcode_end_byte)
            }
            if(typeof(result.estimated_time)!="undefined"){
                variables.setPrintTime(result.estimated_time)
            }
        }
    })
})
module.exports = event;