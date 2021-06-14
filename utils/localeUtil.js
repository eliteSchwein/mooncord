const args = process.argv.slice(2)
const config = require(`${args[0]}/mooncord.json`)
const locale = require(`../locales/${config.language}.json`)

module.exports = () => { return locale }