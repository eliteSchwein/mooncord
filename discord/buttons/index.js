const printJob = require('./printJob')
const printJobStart = require('./printJobStart')
const klipperRestart = require('./klipperRestart')
const updateSystem = require('./updateSystem')
const listFiles = require('./listFiles')

module.exports = (button) => {
  printJob(button)
  printJobStart(button)
  klipperRestart(button)
  updateSystem(button)
  listFiles(button)
}