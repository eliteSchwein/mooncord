var test = require("./test")
var variables = require("./variables")

var getModules = (function(express,client){
    test(express)
    variables(client)
})
module.exports = getModules;