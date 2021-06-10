const args = process.argv.slice(2)

const glob = require('glob')
const fs = require('fs')
const path = require('path')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')

const webcamUtil = require('./webcamUtil')
const variablesUtil = require('./variablesUtil')
const config = require(`${args[0]}/mooncord.json`)

const conv = ffmpeg()

let discordClient
let moonrakerClient

let running = false
let framecount = 1

ffmpeg.setFfmpegPath(ffmpegPath)

async function renderAndPost(channelid) {
    if (!running) {
        return
    }
    conv
        .addInput(path.resolve(__dirname,
            '../temp/timelapse/frame-%d.png'))
        .inputFPS(config.timelapse.framerate)
        .output(path.resolve(__dirname, '../temp/timelapse/timelapse.mp4'))
        .outputFPS(config.timelapse.framerate)
        .outputOptions("-pix_fmt yuv420p")
        .noAudio()
        .videoCodec('libx264')
        .preset('faster')
        .on('end', async function (stdout, stderr) {
            const channel = await discordClient.getClient().channels.fetch(channelid)
            channel.send(`\`Timelapse for ${variablesUtil.getLastGcodeFile()}\``, {
                files: [{
                    attachment: path.resolve(__dirname, '../temp/timelapse/timelapse.mp4'),
                    name: 'timelapse.mp4'
                }]
            })
        })
        .run()
}

async function makeFrame() {
    if (!running) {
        return
    }
    const snapshot = await webcamUtil.retrieveWebcam()
    const frame = await fs.writeFileSync(path.resolve(__dirname,
        `../temp/timelapse/frame-${framecount}.png`),
        snapshot.attachment, 'base64')
    framecount ++
}

module.exports.init = (dcClient, mrClient) => {
    running = true
    discordClient = dcClient
    moonrakerClient = mrClient
}
module.exports.isRunning = () => { return running }
module.exports.makeFrame = () => { makeFrame() }
module.exports.renderAndPost = (channelid) => { renderAndPost(channelid) }
module.exports.start = () => {
    if (!running) {
        return
    }
    fs.unlink(path.resolve(__dirname, '../temp/timelapse/timelapse.mp4'), (err) => {
        if (err) return;
    });
    framecount = 1
    const pattern = /^frame-+/
    fs.readdir(path.resolve(__dirname,'../temp/timelapse'), (err, fileNames) => {
        if (err) return;

        for (const name of fileNames) {

            if (pattern.test(name)) {

                fs.unlink(path.resolve(__dirname,`../temp/timelapse/${name}`), (err) => {
                    if (err) return;
                });
            }
        }
    });
}