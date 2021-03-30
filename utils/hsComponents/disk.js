const si = require('systeminformation')

module.exports = {}
module.exports.getTitle = () => { return 'Disks' }
module.exports.getFields = async () => {
    const disks = await si.diskLayout()
    
    const fields = []

    for (const diskindex in disks) {
        
        const disk = disks[diskindex]

        if (!String(disk.device).includes('/dev/ram')) {
            fields.push({
                name: `Disk ${diskindex} Name`,
                value: `${disk.device}`,
                inline: true
            })
            fields.push({
                name: `Disk ${diskindex} Model`,
                value: `${disk.name}`,
                inline: true
            })
            fields.push({
                name: `Disk ${diskindex} Vendor`,
                value: `${disk.vendor}`,
                inline: true
            })
            fields.push({
                name: `Disk ${diskindex} Size`,
                value: `${(disk.size / (1024 ** 3)).toFixed(2)}GB`,
                inline: true
            })
        }
    }
    return fields
}