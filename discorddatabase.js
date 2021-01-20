const databasepath = "../discorddatabase.json"
const fs = require('fs');

module.exports.getDatabase = function(guild){
  var database = require(databasepath);
  if(typeof database[guild.id] == "undefined"){
    console.log("No Database for "+guild.name+" found!\nGenerate base config!")
    database[guild.id] = {
      statuschannels : [],
      adminusers : [],
      adminroles : [],
      accessusers : [],
      accessusers : [],
      accesseveryone : false
    }
    this.updateDatabase(database[guild.id],guild)
  }
  console.log(database[guild.id])
  return require(databasepath)
};
module.exports.updateDatabase = function(data,guild){
  var database = require(databasepath);
  database[guild.id]=data
  fs.writeFile(databasepath, JSON.stringify(database), (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
};