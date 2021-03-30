const si = require('systeminformation')

module.exports = {}
module.exports.getTitle = () => { return 'Disks' }
module.exports.getFields = async () => {
    const partitions = await si.fsSize()
    
    const fields = []

    for (const partitionindex in partitions) {
        const partition = disks[partitionindex]

        fields.push({
            name: `Partition ${partitionindex} Name`,
            value: `${partition.fs}`,
            inline: true
        })
        fields.push({
            name: `Partition ${partitionindex} Type`,
            value: `${partition.type}`,
            inline: true
        })
        fields.push({
            name: `Partition ${partitionindex} Mount`,
            value: `${partition.mount}`,
            inline: true
        })
        fields.push({
            name: `Partition ${partitionindex} Size`,
            value: `${(partition.size / (1024 ** 3)).toFixed(2)}GB`,
            inline: true
        })
        fields.push({
            name: `Partition ${partitionindex} Used`,
            value: `${(partition.used / (1024 ** 3)).toFixed(2)}GB`,
            inline: true
        })
    }
    return fields
}