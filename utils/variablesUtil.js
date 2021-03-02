var status = 'unknown'
var versions = ''
var gcodefile = ''
var gcodestartbyte = 0
var gcodeendbyte = 0
var gcodethumbnail = ''
var printprogress = 0
var remainingprinttime = 0
var printtime = 0
var temps = {}
var updatetimer = 0

function triggerStatusUpdate(discordClient,channel,guild,user){
    console.log("Printer Status: "+status)
    var event = require('../status-messages/'+status);
    setTimeout(()=>{
        event(discordClient,channel,guild,user)
    },1000)

}

module.exports.triggerStatusUpdate = function(discordClient,channel,guild,user){
    triggerStatusUpdate(discordClient,channel,guild,user);
}

module.exports.setUpdateTimer = function(newupdatetimer){
    updatetimer=newupdatetimer
}

module.exports.setTemps = function(newtemps){
    temps=newtemps
}
module.exports.setStatus = function(newstatus){
    status = newstatus
}
module.exports.setVersions = function(newversions){
    versions = newversions
}
module.exports.setCurrentFile = function(newfile){
    gcodefile=newfile
}
module.exports.setStartByte = function(startbyte){
    gcodestartbyte=startbyte
}
module.exports.setEndByte = function(endbyte){
    gcodeendbyte=endbyte
}
module.exports.setThumbnail = function(thumbnail){
    gcodethumbnail=thumbnail
}
module.exports.setProgress = function(progress){
    printprogress=progress
}
module.exports.setRemainingTime = function(remainingtime){
    remainingprinttime=remainingtime
}
module.exports.setPrintTime = function(newtime){
    printtime=newtime
}
module.exports.getUpdateTimer = function(){
    return updatetimer
}
module.exports.getTemps = function(){
    return temps
}
module.exports.getStatus = function(){
    return status
}
module.exports.getThumbnail = function(){
    return gcodethumbnail
}
module.exports.getCurrentFile = function(){
    return gcodefile
}
module.exports.getProgress = function(){
    return printprogress
}
module.exports.getRemainingTime = function(){
    return remainingprinttime
}
module.exports.getFormatedRemainingTime = function(){
    return formatDateTime(remainingprinttime*1000)
}
module.exports.getVersions = function(){
    return versions
}
module.exports.getPrintStartByte = function(){
    return gcodestartbyte
}
module.exports.getPrintEndByte = function(){
    return gcodeendbyte
}
module.exports.getPrintTime = function(){
    return printtime
}
module.exports.getFormatedPrintTime = function(){
    return formatDateTime(printtime*1000)
}

function formatDateTime(msec) {
    const date = new Date(msec)
    var hours = date.getHours()
    hours=hours-1
    const h = hours >= 10 ? hours : "0"+hours
    const m = date.getMinutes() >= 10 ? date.getMinutes() : "0"+date.getMinutes()
    return h+":"+m
}