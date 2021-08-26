module.exports = (data, connection, discordClient, database) => {
  Object.keys(data).forEach(key => {
    if (!/(temp)/g.test(key) && 
        /(mcu)/g.test(key)) {
      console.log(key)
    }
  })
}