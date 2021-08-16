const args = process.argv.slice(2)

const statusconfig = require(`${args[0]}/mooncord.json`)
const database = require('./databaseUtil')

module.exports.init = () => {
  if (statusconfig.status.use_percent) {
    setInterval(() => {
      const ramDatabase = database.getRamDatabase()
      const currentTime = ramDatabase.cooldown
      if (currentTime > 0) {
        database.updateRamDatabase("cooldown", currentTime - 1)
      }
    }, 1000)
  }
}
module.exports.convertChoices = (choices) => {
  let answer = []
  for (let index in Object.keys(choices)) {
    let value = choices[index]
    answer.push([value.name, value.value])
  }
  return answer
}