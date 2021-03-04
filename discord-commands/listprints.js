const config = require('../config.json');
const admin = true
const master = false
const discordDatabase = require('../discorddatabase')
const Discord = require('discord.js');
var id = Math.floor(Math.random() * 10000) + 1
var wsConnection
var messageChannel
var requester
var pageUp = false
var currentPage = 1
var maxEntries = 10
var executeCommand = (function(command,channel,user,guild,discordClient,websocketConnection){
    requester=user
    messageChannel=channel
    wsConnection=websocketConnection
    channel.startTyping();
    websocketConnection.send('{"jsonrpc": "2.0", "method": "server.files.list", "params": {"root": "gcodes"}, "id": '+id+'}')
    
    websocketConnection.on('message', handler);
    channel.stopTyping();
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

    messageChannel.send(exampleEmbed);
}
module.exports = executeCommand;
module.exports.needAdmin = function(){return admin}
module.exports.needMaster = function(){return master}