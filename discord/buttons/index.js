const klipperRestart = require('./klipperRestart')
const listFiles = require('./listFiles')
const printJob = require('./printJob')
const printJobStart = require('./printJobStart')
const updateSystem = require('./updateSystem')

module.exports = (button) => {
  printJob(button)
  printJobStart(button)
  klipperRestart(button)
  updateSystem(button)
  listFiles(button)
}