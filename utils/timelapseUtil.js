const args = process.argv.slice(2)

const glob = require('glob')
const fs = require('fs')
const path = require('path')
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
    const frame = await fs.writeFileSync(path.resolve(__dirname, `../temp/timelapse/frame-${framecount}.png`), snapshot, 'base64')
    frames.push(`../temp/timelapse/frame-${framecount}.png`)
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
    framecount = 1
    const pattern = /^frame-+/
    fs.readdir(path.resolve(__dirname,'../temp/timelapse'), (err, fileNames) => {
        if (err) throw err;

        // iterate through the found file names
        for (const name of fileNames) {

            // if file name matches the pattern
            if (pattern.test(name)) {

                // try to remove the file and log the result
                fs.unlink(path.resolve(__dirname,`../temp/timelapse/${name}`), (err) => {
                    if (err) throw err;
                    console.log(`Deleted ${name}`);
                });
            }
        }
    });
}