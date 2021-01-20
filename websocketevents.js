var status = 'unknown'
var klipperversion = ''
var printfile = ''
var printthumbnail = ''
var printprogress = 0
var restprinttime = ''

var ready_event = require('./websocket-events/ready');

var getModule = (function(client,discordClient){
    client.on('connect', function(connection) {
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var messageJson = JSON.parse(message.utf8Data)
                var methode = messageJson.method
                var result = messageJson.result
                if(methode=="notify_klippy_disconnected"){
                    status="disconnected"
                }
                if(methode=="notify_klippy_shutdown"){
                    status="shutdown"
                }
                if(methode=="notify_klippy_ready"){
                    status="ready"
                }
                if(methode=="notify_gcode_response"){
                    var params = messageJson.params
                    if(params[0].startsWith("File opened")){
                        var removeSize = params[0].substring(0,params[0].indexOf(" Size"))
                        var removeFileTag = removeSize.substring(12)
                        printfile=removeFileTag;
                        connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+printfile+'"}, "id": '+id+'}')
                    }
                }
                if(typeof(result)!="undefined"){
                    if(typeof(result.state)!="undefined"){
                        status=result.state
                    }
                    if(typeof(result.klippy_connected)!="undefined"){
                        ready_event(discordClient)
                        status="ready"
                    }
                    if(typeof(result.software_version)!="undefined"){
                        klipperversion=result.software_version
                    }
                    if(typeof(result.thumbnails)!="undefined"){
                        printthumbnail=result.thumbnails[1].data
                    }
                }
                console.log("Received: '" + message.utf8Data + "'");
                console.log("method: "+messageJson.method)
            }
        });
        let id = Math.floor(Math.random() * 10000) + 1
        setTimeout(function(){
            connection.send('{"jsonrpc": "2.0", "method": "printer.info", "id": '+id+'}')
            connection.send('{"jsonrpc": "2.0", "method": "server.info", "id": '+id+'}')
        },2000)
    });
    
})
module.exports = getModule;

module.exports.updateStatus = function(status){
    this.status = status
}
module.exports.getStatus = function(){
    return status
}
module.exports.getThumbnail = function(){
    return printthumbnail
}
module.exports.getPrintFile = function(){
    return printfile
}
module.exports.getPrintProgress = function(){
    return printprogress
}
module.exports.getPrintFile = function(){
    return printfile
}
module.exports.getPrintTime = function(){
    return restprinttime
}
module.exports.getKlipperVersion = function(){
    return klipperversion
}