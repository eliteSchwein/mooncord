const args = process.argv.slice(2)

const glob = require('glob')
const fs = require('fs')
const ffmpeg = require('ffmpeg-stream')

const webcamUtil = require('./webcamUtil')
const variableUtil = require('./variablesUtil')
const config = require(`${args[0]}/mooncord.json`)

let discordClient
let moonrakerClient

let frames = []
let running = false
let framecount = 1

async function render() {
    if (!running) {
        return
    }
    if (frames.length < 1) {
        return
    }
    const conv = ffmpeg()
    const input = conv.input({f: 'image2pipe', r: config.timelapse.framerate})
    conv.output('../temp/timelapse/timelapse.mp4', {vcodec: 'libx264', pix_fmt: 'yuv420p'})
    frames.map(filename => () =>
    new Promise((fulfill, reject) =>
        s3
        .getObject({Bucket: '...', Key: filename})
        .createReadStream()
        .on('end', fulfill)
        .on('error', reject)
        .pipe(input, {end: false})
    )
    )
    .reduce((prev, next) => prev.then(next), Promise.resolve())
    .then(() => input.end())
}

async function makeFrame() {
    if (!running) {
        return
    }
    const snapshot = await webcamUtil.retrieveWebcam()
    const frame = await fs.writeFileSync(`../temp/timelapse/frame-${framecount}.jpg`, snapshot, 'base64')
    frames.push(`../temp/timelapse/frame-${framecount}.jpg`)
    framecount ++
}

module.exports.init = (discordClient, moonrakerClient) => {
    running = true
    discordClient = discordClient
    moonrakerClient = moonrakerClient
    discordClient.registerDynamicCommand('timelapse')
}
module.exports.isRunning = () => { return running }
module.exports.makeFrame = () => { makeFrame() }
module.exports.render = () => { render() }
module.exports.start = () => {
    if (!running) {
        return
    }
    framecount = 1
    glob("**/frame-*.jpg", options, function (er, files) {
        for (const file of files) {
            fs.unlink(file)
        }
    })
}