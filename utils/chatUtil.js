module.exports = {}
module.exports.hasMessageEmbed = function (message) {
  if (message.channel.type !== 'text') {
    return false
  }
  if (message.embeds.length === 0) {
    return false
  }
  return true
}
