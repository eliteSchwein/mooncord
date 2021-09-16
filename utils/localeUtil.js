const args = process.argv.slice(2)


const configData = fs.readFileSync(`${args[0]}/mooncord.json`, {encoding: 'utf8'})
const config = JSON.parse(configData)
const locale = require(`../locales/${config.language.messages}.json`)
const syntaxlocale = require(`../locales/${config.language.command_syntax}.json`)

module.exports = locale
module.exports.syntaxlocale = syntaxlocale
module.exports.getAdminOnlyError = (username) => {
    return locale.errors.admin_only.replace(/(\${username})/g, username)
}
module.exports.getControllerOnlyError = (username) => {
    return locale.errors.controller_only.replace(/(\${username})/g, username)
}
module.exports.getGuildOnlyError = (username) => {
    return locale.errors.guild_only.replace(/(\${username})/g, username)
}
module.exports.getCommandNotReadyError = (username) => {
    return locale.errors.not_ready.replace(/(\${username})/g, username)
}