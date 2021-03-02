const fs = require('fs')
const variables = require("./utils/variablesUtil")

var getModule = (function(client,discordClient){
    client.on('connect', function(connection) {
        let id = Math.floor(Math.random() * 10000) + 1
        connection.send('{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "true"}, "id": '+id+'}')
        connection.send('{"jsonrpc": "2.0", "method": "printer.info", "id": '+id+'}')
        connection.send('{"jsonrpc": "2.0", "method": "server.info", "id": '+id+'}')
        connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+variables.getCurrentFile()+'"}, "id": '+id+'}')
        setInterval(function(){
            connection.send('{"jsonrpc": "2.0", "method": "server.temperature_store", "id": '+id+'}')
            connection.send('{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": '+id+'}')
            connection.send('{"jsonrpc": "2.0", "method": "machine.update.status", "params":{"refresh": "true"}, "id": '+id+'}')
        },1000)
        fs.readdir(__dirname+"/websocket-events", (err, files) => {
            files.forEach(file => {
                delete require.cache[require.resolve("./websocket-events/"+file)]
                const event = require("./websocket-events/"+file)
                event(connection,discordClient)
            });
        });
    });
    
})
module.exports = getModule;