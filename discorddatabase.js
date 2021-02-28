const databasepath = "./discorddatabase.json"
const fs = require('fs');

exports.getGuildDatabase = function(guild){
  var database = require(databasepath);
  if(typeof database[guild.id] == "undefined"){
    console.log("No Database for "+guild.name+" found!\nGenerate base config!")
    database[guild.id] = {
      statuschannels : [],
      adminusers : [],
      adminroles : [],
      accessrole : [],
      accessusers : [],
      accesseveryone : false
    }
    this.updateDatabase(database[guild.id],guild)
  }
  return database[guild.id]
};
exports.getDatabase = function(){
  return require(databasepath)
};
exports.updateDatabase = function(data,guild){
  var database = require(databasepath);
  database[guild.id]=data
  fs.writeFile(databasepath, JSON.stringify(database), (err) => {
      if (err) throw err;
      console.log('The Database has been saved!');
    });
};