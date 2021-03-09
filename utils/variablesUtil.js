let status = 'unknown'
let versions = undefined
let gcodefile = ''
let gcodestartbyte = 0
let gcodeendbyte = 0
let gcodethumbnail = ''
let printprogress = 0
let remainingprinttime = 0
let printtime = 0
let temps = {}
let updatetimer = 0

module.exports.setUpdateTimer = function (newupdatetimer) {
  updatetimer = newupdatetimer
}

module.exports.setTemps = function (newtemps) {
  temps = newtemps
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
module.exports.getUpdateTimer = function () {
  return updatetimer
}
module.exports.getTemps = function () {
  return temps
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
  return formatDateTime(remainingprinttime * 1000)
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
  return formatDateTime(printtime * 1000)
}

function formatDateTime (msec) {
  const date = new Date(msec)
  let hours = date.getHours()
  hours -= 1
  const h = hours >= 10 ? hours : `0${  hours}`
  const m = date.getMinutes() >= 10 ? date.getMinutes() : `0${  date.getMinutes()}`
  return `${h  }:${  m}`
}
