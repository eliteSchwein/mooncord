const config = require('../config.json');
const admin = false
const master = false
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
var id = Math.floor(Math.random() * 10000) + 1
var wsConnection
var dcMessage
var requester
var pageUp = false
var currentPage = 1
var maxEntries = 10
var executeReaction = (function(message,user,guild,emote,discordClient,websocketConnection){
    requester=user
    dcMessage=message
    wsConnection=websocketConnection
    if(emote.name=="▶️"){
        pageUp=true
    }else if(emote.name=="◀️"){
        pageUp=false
    }else{
        return
    }
    var pages = message.embeds[0].author.name
    var currentPageString = pages.replace("Page ","").split("/")[0]
    currentPage=parseInt(currentPageString)-1
    websocketConnection.send('{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": '+id+'}')
    websocketConnection.on('message', handler);
})

function handler(message){
    var messageJson = JSON.parse(message.utf8Data)
    sendPage(messageJson)
    wsConnection.removeListener('message', handler)

}

function sendPage(allFiles){
    var newpage = currentPage
    var maxpage = (allFiles.result.length/maxEntries).toFixed(0)
    if(pageUp){
        if(currentPage!=maxpage-1){
            newpage=currentPage+1
        }
    }else{
        if(currentPage!=0){
            newpage=currentPage-1
        }
    }
    var entries = "\n";
    for(var i = (newpage * maxEntries) + newpage; i <= maxEntries + (newpage * maxEntries) + newpage; i++){
        if(i<allFiles.result.length){
            entries=entries.concat(allFiles.result[i].filename+"\n")
        }
    }
    const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Print Files')
	.setAuthor('Page '+(newpage+1)+'/'+maxpage)
	.setDescription(entries)
    .attachFiles(__dirname+"/../images/printlist.png")
    .setThumbnail(url="attachment://printlist.png")
	.setTimestamp()
	.setFooter(requester.tag, requester.avatarURL());

    dcMessage.edit(exampleEmbed)
}
module.exports = executeReaction;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}