const args = process.argv.slice(2)

const glob = require('glob')
const fs = require('fs')
const path = require('path')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')

const webcamUtil = require('./webcamUtil')
const variableUtil = require('./variablesUtil')
const config = require(`${args[0]}/mooncord.json`)

const conv = ffmpeg()

let discordClient
let moonrakerClient

let running = false
let framecount = 1

ffmpeg.setFfmpegPath(ffmpegPath)

async function render() {
    if (!running) {
        return
    }

    conv
        .addInput(path.resolve(__dirname,
            '../temp/timelapse/frame-%d.png'))
        .inputFPS(1)
        .output(path.resolve(__dirname, '../temp/timelapse/timelapse.mp4'))
        .outputFPS(config.timelapse.framerate)
        .noAudio()
        .on('start', function(commandLine) {
            console.log('Spawned Ffmpeg with command: ' + commandLine);
        })
        .on('codecData', function(data) {
            console.log('Input is ' + data.audio + ' audio ' +
            'with ' + data.video + ' video');
        })
        .on('progress', function(progress) {
            console.log('Processing: ' + progress.percent + '% done');
        })
        .on('stderr', function(stderrLine) {
            console.log('Stderr output: ' + stderrLine);
        })
        .on('error', function (err, stdout, stderr) {
            console.log('Cannot process video: ' + err.message);
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

module.exports.init = (discordClient, moonrakerClient) => {
    running = true
    discordClient = discordClient
    moonrakerClient = moonrakerClient
}
module.exports.isRunning = () => { return running }
module.exports.makeFrame = () => { makeFrame() }
module.exports.render = () => { render() }
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