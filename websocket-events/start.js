const discordDatabase = require('../discorddatabase')
const fetcher = require('../utils/templateFetcher')
const fs = require('fs');
const config = require('../config.json');

var template = '';

var getModule = (async function(discordClient,channel,guild){
    var database = discordDatabase.getDatabase();
    discordClient.user.setActivity("Starting...",{type: "WATCHING"})
    
    if(typeof channel =="undefined"){
        for(var guildid in database){
            discordClient.guilds.fetch(guildid)
            .then(function(guild){
                var guilddatabase = database[guild.id]
                var theme = config.defaulttheme
                if(guilddatabase.theme!="default"){
                    theme=guilddatabase.theme
                }
                var broadcastchannels = guilddatabase.statuschannels
                for(var index in broadcastchannels){
                    var channel = guild.channels.cache.get(broadcastchannels[index]);
                    sendMessage(channel,theme)
                }
            })
            .catch(console.error);
        }
    }else{
        var guilddatabase = database[guild.id]
        var theme = config.defaulttheme
        if(guilddatabase.theme!="default"){
            theme=guilddatabase.theme
        }
        sendMessage(channel,theme)
    }
})

function sendMessage(channel,theme){
    readTemplateFile('./themes/'+theme+'/templates/print_start.html',async function (err,templatefile){
        if(err){
            channel.send("The File `templates/print_start.html` \ncouldn't be found in the Theme:\n`"+theme+"`")
            return
        }
        template=templatefile
        template = await fetcher.retrieveWebcam(template)
        template = await fetcher.retrieveThumbnail(template)
        template = await fetcher.retrieveOverlay(template,theme)
        template = await fetcher.retrieveFile(template)
        template = await fetcher.retrieveTime(template)
        template = await fetcher.retrieveKlipperVersion(template)
        await (async () => {
            const browser = await puppeteer.launch({args: [
                '--window-size=1920,1080',
              ],});
            const page = await browser.newPage();
            await page.setContent( template, {waitUntil: 'networkidle0'} );
            await page._client.send('Emulation.clearDeviceMetricsOverride');
            var image = await page.screenshot({});
            channel.send({
                files:[{
                    attachment: image,
                    name: 'ready.png'
                }]
            })
          
            await browser.close();
          })();
    });
}
module.exports = getModule;

function readTemplateFile(path, callback) {
    try {
        fs.readFile(path, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}