var status = 'unknown'
var oldStatus = 'unknown'
var klipperversion = ''
var printfile = ''
var printthumbnail = ''
var printprogress = 0
var restprinttime = ''

var getModule = (function(client,discordClient){
    var timer;
    this.discordClient=discordClient;
    
    client.on('connect', function(connection) {
        timer = setInterval(function(){
            connection.send('{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": '+id+'}')
        },1000)
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                var messageJson = JSON.parse(message.utf8Data)
                var methode = messageJson.method
                var result = messageJson.result
                if(methode=="notify_klippy_disconnected"){
                    status="disconnected"
                    if(status!=oldStatus){
                        oldStatus=status
                        triggerStatusUpdate(discordClient)
                    }
                }
                if(methode=="notify_klippy_shutdown"){
                    status="shutdown"
                    if(status!=oldStatus){
                        oldStatus=status
                        triggerStatusUpdate(discordClient)
                    }
                }
                if(methode=="notify_klippy_ready"){
                    status="ready"
                    if(status!=oldStatus){
                        oldStatus=status
                        triggerStatusUpdate(discordClient)
                    }
                }
                if(methode=="notify_gcode_response"){
                    var params = messageJson.params
                    if(params[0].startsWith("File opened")){
                        var removeSize = params[0].substring(0,params[0].indexOf(" Size"))
                        var removeFileTag = removeSize.substring(12)
                        printfile=removeFileTag;
                        connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+printfile+'"}, "id": '+id+'}')
                        status="start"
                        if(status!=oldStatus){
                            oldStatus=status
                            triggerStatusUpdate(discordClient)
                        }
                        status="printing"
                    }
                    if(params[0]=="// action:cancel"){
                        status="stop"
                        if(status!=oldStatus){
                            oldStatus=status
                            triggerStatusUpdate(discordClient)
                        }
                    }
                }
                if(typeof(result)!="undefined"){
                    if(typeof(result.klippy_state)!="undefined"){
                        status=result.klippy_state
                        if(status!=oldStatus){
                            oldStatus=status
                            triggerStatusUpdate(discordClient)
                        }
                    }
                    if(typeof(result.software_version)!="undefined"){
                        klipperversion=result.software_version
                    }
                    if(typeof(result.thumbnails)!="undefined"){
                        printthumbnail=result.thumbnails[1].data
                    }
                    if(typeof(result.status)!="undefined"){
                        var klipperstatus = result.status;
                        if(typeof(klipperstatus.virtual_sdcard)!="undefined"){
                            printprogress=klipperstatus.virtual_sdcard.progress
                        }
                        if(typeof(klipperstatus.print_stats)!="undefined"){
                            if(klipperstatus.print_stats.state=="paused"){
                                status="pause";
                                if(status!=oldStatus){
                                    oldStatus=status
                                    triggerStatusUpdate(discordClient)
                                }
                            }
                            if(klipperstatus.print_stats.state=="printing"){
                                status="printing";
                                if(status!=oldStatus){
                                    oldStatus=status
                                    triggerStatusUpdate(discordClient)
                                }
                            }
                        }
                    }
                }
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

function triggerStatusUpdate(discordClient,channel){
    console.log("Printer Status: "+status)
    var event = require('./websocket-events/'+status);
    event(discordClient,channel)

}

module.exports.triggerStatusUpdate = function(discordClient,channel){
    triggerStatusUpdate(discordClient,channel);
}

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