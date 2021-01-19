var databasepath = "@/discorddatabase.json"

module.exports.getDataBase = function(){return require(databasepath)};
module.exports.updateDataBase = function(database){
    const data = new Uint8Array(Buffer.from(database));
    fs.writeFile(databasepath, data, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
};