const args = process.argv.slice(2)

const { waitUntil } = require('async-wait-until')
const Discord = require('discord.js')
const fs = require('fs')
const path = require('path')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
const logSymbols = require('log-symbols')

const locale = require('./localeUtil')
const variablesUtil = require('./variablesUtil')
const statusUtil = require('./statusUtil')
const webcamUtil = require('./webcamUtil')

const config = require(`${args[0]}/mooncord.json`)

const conv = ffmpeg()

let discordClient
let moonrakerClient

let running = false
let framecount = 1
let lastLayer = 0
let lastPercent = 0

ffmpeg.setFfmpegPath(ffmpegPath)

function checkForFrames() {
    const pattern = /^frame-+/
    return fs.readdirSync(path.resolve(__dirname,'../temp/timelapse'), (err, fileNames) => {
        if (err) { return false }

        for (const name of fileNames) {
            if (pattern.test(name)) {
                return true
            }
        }
    });
}
async function render() {
    if (!running) {
        return
    }
    let renderdone = false

    const hasFrames = checkForFrames()

    if (!hasFrames) { return }
    
    conv
        .addInput(path.resolve(__dirname,
            '../temp/timelapse/frame-%d.png'))
        .inputFPS(config.timelapse.framerate)
        .output(path.resolve(__dirname, '../temp/timelapse/timelapse.mp4'))
        .outputFPS(config.timelapse.framerate)
        .outputOptions([
            '-pix_fmt yuv420p',
            '-preset faster',
            '-crf 30'])
        .noAudio()
        .videoCodec('libx264')
        .on('end', async (stdout, stderr) => {
            renderdone = true
        })
        .run()
    await waitUntil(() => renderdone === true, { timeout: Number.POSITIVE_INFINITY })
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

function getTimelapse() {
    if (!running) {
        return
    }
    try {
        const data = fs.readFileSync(path.resolve(__dirname, '../temp/timelapse/timelapse.mp4'))
        return new Discord.MessageAttachment(data, 'timelapse.mp4')
    } catch (error) {
        console.log(logSymbols.error, `Timelapse Util: ${error}`.error)
    }
}

function generateLayerFrame() {
    if (variablesUtil.getCurrentLayer() === lastLayer) { return }
    makeFrame()
    lastLayer = variablesUtil.getCurrentLayer()
}
function generatePercentFrame() {
    if (variablesUtil.getProgress() === lastPercent) { return }
    makeFrame()
    lastPercent = variablesUtil.getProgress()
}

module.exports.init = (dcClient, mrClient) => {
    running = true
    discordClient = dcClient
    moonrakerClient = mrClient
    if (config.timelapse.frame_every_layer ||
        config.timelapse.frame_every_percent) {
        setInterval(() => {
            if (statusUtil.getStatus() !== 'printing') { return }

            generateLayerFrame()
            generatePercentFrame()
        }, 500)
    }
}
module.exports.isRunning = () => { return running }
module.exports.makeFrame = () => { makeFrame() }
module.exports.render = async () => { await render() }
module.exports.getTimelapse = () => { return getTimelapse() }
module.exports.getEmbed = () => {
    if (!running) {
        return
    }
    const timelapse = getTimelapse()
    const description = locale.timelapse.for_gcode
        .replace(/(\${gcode_file})/g, variablesUtil.getLastPrintJob())
    return new Discord.MessageEmbed()
        .setDescription(description)
        .attachFiles(timelapse)
}
module.exports.start = () => {
    fs.unlink(path.resolve(__dirname, '../temp/timelapse/timelapse.mp4'), (err) => {
        if (err) {}
    })
    lastHeight = 0
    framecount = 1
    const pattern = /^frame-+/
    fs.readdir(path.resolve(__dirname,'../temp/timelapse'), (err, fileNames) => {
        if (err) { return }

        for (const name of fileNames) {

            if (pattern.test(name)) {

                fs.unlink(path.resolve(__dirname,`../temp/timelapse/${name}`), (err) => {
                    if (err) {}
                });
            }
        }
    });
}