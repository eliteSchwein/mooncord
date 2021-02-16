const config = require('./config.json');
const discordDataBase = require('./discorddatabase')

var status = 'unknown'
var oldStatus = 'unknown'
var klipperversion = ''
var printfile = ''
var printstartbyte = 0
var printendbyte = 0
var printthumbnail = ''
var printprogress = 0
var restprinttime = ''
var printtime = 0
var formatedprinttime = ''
var oldpercent = 0

var getModule = (function(client,discordClient){
    var timer;
    this.discordClient=discordClient;
    
    client.on('connect', function(connection) {
        let id = Math.floor(Math.random() * 10000) + 1
        connection.on('message', function(message) {
            id = Math.floor(Math.random() * 10000) + 1
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
                        if(!config.statusupdatepercent){
                            timer=setInterval(function(){
                                triggerStatusUpdate(discordClient)
                            },1000*config.statusupdateinterval)
                        }
                        status="printing"
                    }
                    if(params[0]=="// action:cancel"){
                        status="stop"
                        if(status!=oldStatus){
                            oldStatus=status
                            triggerStatusUpdate(discordClient)
                            clearInterval(timer)
                        }
                        setTimeout(function(){
                            status="ready"
                            triggerStatusUpdate(discordClient)
                        },2000)
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
                    if(typeof(result.gcode_start_byte)!="undefined"){
                        printstartbyte=result.gcode_start_byte
                    }
                    if(typeof(result.gcode_end_byte)!="undefined"){
                        printendbyte=result.gcode_end_byte
                    }
                    if(typeof(result.estimated_time)!="undefined"){
                        printtime=result.estimated_time
                        formatedprinttime=formatDateTime(printtime*1000)
                    }
                    if(typeof(result.status)!="undefined"){
                        var klipperstatus = result.status;
                        if(typeof(klipperstatus.virtual_sdcard)!="undefined"){
                            if (klipperstatus.virtual_sdcard.file_position <= printstartbyte){
                                printprogress=0;
                            }else if (klipperstatus.virtual_sdcard.file_position >= printendbyte){
                                printprogress=100;
                            }else{
                                let currentPosition = klipperstatus.virtual_sdcard.file_position - printstartbyte;
                                let maxPosition = printendbyte - printstartbyte;
                                if(currentPosition > 0 && maxPosition > 0){
                                    printprogress=(1/maxPosition*currentPosition)*100
                                }else{
                                    printprogress=klipperstatus.virtual_sdcard.progress
                                }
                            }
                            if(status=="printing"){
                                connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+printfile+'"}, "id": '+id+'}')
                                if(printprogress.toFixed(0)!=0&&printprogress.toFixed(0)!=100){
                                    if(oldpercent!=printprogress.toFixed(0)){
                                        oldpercent=printprogress.toFixed(0)
                                        discordClient.user.setActivity("Printing: "+printprogress.toFixed(0)+"%",{type: "WATCHING"})
                                        if(config.statusupdatepercent){
                                            if(printprogress.toFixed(0) % config.statusupdateinterval === 0){
                                                triggerStatusUpdate(discordClient)
                                            }
                                        }
                                    }
                                }
                            }

                        }
                        if(typeof(klipperstatus.print_stats)!="undefined"){
                            printfile=klipperstatus.print_stats.filename
                            var printduration = klipperstatus.print_stats.print_duration.toFixed(0)
                            var remainingprinttime = printtime-printduration;
                            restprinttime=formatDateTime(remainingprinttime*1000)
                            if(klipperstatus.print_stats.state=="paused"){
                                status="pause";
                                if(status!=oldStatus){
                                    oldStatus=status
                                    triggerStatusUpdate(discordClient)
                                    clearInterval(timer)
                                }
                            }
                            if(klipperstatus.print_stats.state=="printing"){
                                if(typeof(printfile)!="undefined"||printfile!=""){
                                    connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+printfile+'"}, "id": '+id+'}')
                                    status="printing";
                                    if(status!=oldStatus){
                                        oldStatus=status
                                        if(!config.statusupdatepercent){
                                            timer=setInterval(function(){
                                                triggerStatusUpdate(discordClient)
                                            },1000*config.statusupdateinterval)
                                        }else{
                                            triggerStatusUpdate(discordClient)
                                        }
                                    }
                                }   
                            }
                            if(klipperstatus.print_stats.state=="complete"){
                                status="done";
                                if(status!=oldStatus){
                                    oldStatus=status
                                    triggerStatusUpdate(discordClient)
                                    setTimeout(function(){
                                        status="ready"
                                        triggerStatusUpdate(discordClient)
                                    },2000)
                                }
                            }
                        }
                    }
                }
            }
        });
        setTimeout(function(){
            setInterval(function(){
                connection.send('{"jsonrpc": "2.0", "method": "printer.objects.query", "params": {"objects": {"webhooks": null, "virtual_sdcard": null, "print_stats": null}}, "id": '+id+'}')
            },1000)
            connection.send('{"jsonrpc": "2.0", "method": "printer.info", "id": '+id+'}')
            connection.send('{"jsonrpc": "2.0", "method": "server.info", "id": '+id+'}')
            connection.send('{"jsonrpc": "2.0", "method": "server.files.metadata", "params": {"filename": "'+printfile+'"}, "id": '+id+'}')
        },2000)
    });
    
})
module.exports = getModule;

function triggerStatusUpdate(discordClient,channel,guild){
    console.log("Printer Status: "+status)
    var event = require('./websocket-events/'+status);
    event(discordClient,channel,guild)

}

function formatDateTime(msec) {
    const date = new Date(msec)
    var hours = date.getHours()
    hours=hours-1
    const h = hours >= 10 ? hours : "0"+hours
    const m = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()
    return h+":"+m
}

module.exports.triggerStatusUpdate = function(discordClient,channel,guild){
    triggerStatusUpdate(discordClient,channel,guild);
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
module.exports.getRestPrintTime = function(){
    return restprinttime
}
module.exports.getPrintTime = function(){
    return formatedprinttime
}
module.exports.getKlipperVersion = function(){
    return klipperversion
}