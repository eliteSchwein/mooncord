const si = require('systeminformation')

module.exports = {}
module.exports.getTitle = () => { return 'RAM' }
module.exports.getFields = async () => {
    const ram = await si.mem()
    
    const fields = [{
        name: 'Total',
        value:`${(ram.total / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    },{
        name: 'Used',
        value:`${(ram.used / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    },{
        name: 'Swap Total',
        value:`${(ram.swaptotal / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    },{
        name: 'Swap Used',
        value:`${(ram.swapused / (1024 ** 3)).toFixed(2)}GB`,
        inline: true
    }]
    
    return fields
}