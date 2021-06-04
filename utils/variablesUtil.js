let status = 'unknown'
let versions
let gcodefile = ''
let gcodestartbyte = 0
let gcodeendbyte = 0
let gcodethumbnail = ''
let printprogress = 0
let remainingprinttime = 0
let printtime = 0
let updatetimer = 0
let inviteurl = ''

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
module.exports.setThumbnail = function (thumbnail) {
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
module.exports.getThumbnail = function () {
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
module.exports.formatTime = (time) => { return formatTime(time / 1000) }

function formatTime (seconds) {
  const h = Math.floor(seconds / 3600)
  seconds %= 3600
  const m = (`0${  Math.floor(seconds / 60)}`).slice(-2)
  const s = (`0${  (seconds % 60).toFixed(0)}`).slice(-2)
  return String(`${h}:${m}:${s}`).replace('-1', '00')
}
