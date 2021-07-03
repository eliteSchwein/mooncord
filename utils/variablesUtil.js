let status = 'unknown'
let versions
let gcodefile = ''
let lastgcodefile = ''
let gcodestartbyte = 0
let gcodeendbyte = 0
let gcodethumbnail = ''
let printprogress = 0
let remainingprinttime = 0
let printtime = 0
let updatetimer = 0
let inviteurl = ''
let mculist = {}
let layerheight = 0
let objectheight = 0
let firstlayerheight = 0
let currentlayer = 0

module.exports.setCurrentLayer = function (z) {
  currentlayer = z
}
module.exports.setLayerHeights = function (layer, maxlayer, firstlayer) {
  layerheight = layer
  objectheight = maxlayer
  firstlayerheight = firstlayer
}
module.exports.addToMCUList = function (mcu) {
  mculist[mcu] = null
}
module.exports.updateMCUStatus = function (mcu, status) {
  mculist[mcu] = status
}
module.exports.clearMCUList = function () {
  mculist = {}
}
module.exports.setInviteUrl = function (url) {
  inviteurl = url
}
module.exports.setUpdateTimer = function (newupdatetimer) {
  updatetimer = newupdatetimer
}
module.exports.setStatus = function (newstatus) {
  status = newstatus
}
module.exports.setVersions = function (newversions) {
  versions = newversions
}
module.exports.setCurrentFile = function (newfile) {
  gcodefile = newfile
}
module.exports.setStartByte = function (startbyte) {
  gcodestartbyte = startbyte
}
module.exports.setEndByte = function (endbyte) {
  gcodeendbyte = endbyte
}
module.exports.setThumbnailPath = function (thumbnail) {
  gcodethumbnail = thumbnail
}
module.exports.setProgress = function (progress) {
  printprogress = progress
}
module.exports.setRemainingTime = function (remainingtime) {
  remainingprinttime = remainingtime
}
module.exports.setPrintTime = function (newtime) {
  printtime = newtime
}
module.exports.updateLastGcodeFile = function () {
  lastgcodefile = gcodefile
}
module.exports.getMaxLayers = function () {
  const max = Math.ceil((objectheight - firstlayerheight) / layerheight + 1)
  return max > 0 ? max : 0
}
module.exports.getCurrentLayer = function () {
  let current_layer = Math.ceil((currentlayer - firstlayerheight) / layerheight + 1)
  current_layer = (current_layer <= max_layers) ? current_layer : max_layers
  return current_layer > 0 ? current_layer : 0
}
module.exports.getLayerHeight = function () {
  return layerheight
}
module.exports.getObjectHeight = function () {
  return objectheight
}
module.exports.getFirstLayerHeight = function () {
  return firstlayerheight
}
module.exports.getMCUList = function () {
  return mculist
}
module.exports.getConfigPath = function () {
  const args = process.argv.slice(2)
  return args[0]
}
module.exports.getInviteUrl = function() {
  return inviteurl
}
module.exports.getUpdateTimer = function () {
  return updatetimer
}
module.exports.getStatus = function () {
  return status
}
module.exports.getThumbnailPath = function () {
  return gcodethumbnail
}
module.exports.getCurrentFile = function () {
  return gcodefile
}
module.exports.getProgress = function () {
  return printprogress
}
module.exports.getRemainingTime = function () {
  return remainingprinttime
}
module.exports.getFormatedRemainingTime = function () {
  return formatTime(remainingprinttime)
}
module.exports.getVersions = function () {
  return versions
}
module.exports.getStartByte = function () {
  return gcodestartbyte
}
module.exports.getEndByte = function () {
  return gcodeendbyte
}
module.exports.getPrintTime = function () {
  return printtime
}
module.exports.getFormatedPrintTime = function () {
  return formatTime(printtime)
}
module.exports.getLastGcodeFile = function () {
  return lastgcodefile
}
module.exports.formatTime = (time) => { return formatTime(time / 1000) }

function formatTime (seconds) {
  const h = Math.floor(seconds / 3600)
  seconds %= 3600
  const m = (`0${  Math.floor(seconds / 60)}`).slice(-2)
  const s = (`0${  (seconds % 60).toFixed(0)}`).slice(-2)
  return String(`${h}:${m}:${s}`).replace('-1', '00')
}
