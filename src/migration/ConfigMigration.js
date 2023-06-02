const fs = require('fs');
const path = require('path');

console.log("starting json config migration to cfg config...")

const args = process.argv.slice(2)
const configPath = args[0]

console.log(`reading json config: ${configPath}/mooncord.json`)

const legacyFile = fs.readFileSync(`${configPath}/mooncord.json`, {encoding: "utf-8"})
const legacyConfig = JSON.parse(legacyFile)

console.log('read base config...')

let newConfig = fs.readFileSync(path.resolve(__dirname, '../../scripts/mooncord.cfg'), {encoding: "utf-8"})

console.log('update base config...')

newConfig =
    newConfig
        .replace('MC_WEBCAM_URL', legacyConfig.webcam.url)
        .replace(/moonraker_url:\s*.*/g, `moonraker_url: ${legacyConfig.connection.moonraker_url}`)
        .replace(/moonraker_token:\s*.*/g, `moonraker_token: ${legacyConfig.connection.moonraker_token}`)
        .replace(/bot_token:\s*.*/g, `bot_token: ${legacyConfig.connection.bot_token}`)
        .replace(/tmp_path:\s*.*/g, `tmp_path: ${legacyConfig.tmp_path}`)

console.log('update detailes cam settings...')

if(legacyConfig.webcam.vertical_mirror !== undefined) {
    newConfig =
        newConfig.replace(/vertical_mirror:\s*.*/g, `vertical_mirror: ${legacyConfig.webcam.vertical_mirror}`)
}

if(legacyConfig.webcam.horizontal_mirror !== undefined) {
    newConfig =
        newConfig.replace(/horizontal_mirror:\s*.*/g, `horizontal_mirror: ${legacyConfig.webcam.horizontal_mirror}`)
}

if(legacyConfig.webcam.rotation !== undefined) {
    newConfig =
        newConfig.replace(/rotate:\s*.*/g, `rotate: ${legacyConfig.webcam.rotation}`)
}

if(legacyConfig.webcam.brightness !== undefined) {
    newConfig =
        newConfig.replace(/brightness:\s*.*/g, `brightness: ${legacyConfig.webcam.brightness}`)
}

if(legacyConfig.webcam.contrast !== undefined) {
    newConfig =
        newConfig.replace(/contrast:\s*.*/g, `contrast: ${legacyConfig.webcam.contrast}`)
}

console.log('write new config, keeping old json config as backup...')

fs.writeFileSync(`${configPath}/mooncord.cfg`, newConfig, {encoding: 'utf8', flag: 'w+'})