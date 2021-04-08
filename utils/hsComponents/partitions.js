const si = require('systeminformation')

const template = {
    "Partition ${partitionindex} Name": {
        "value":  "${partition.fs}"
    },
    "Partition ${partitionindex} Type": {
        "value":  "${partition.type}"
    },
    "Partition ${partitionindex} Mount": {
        "value":  "${partition.mount}"
    },
    "Partition ${partitionindex} Size": {
        "value":  "${partition.size}"
    },
    "Partition ${partitionindex} Used": {
        "value":  "${partition.used}"
    },
}

module.exports = {}
module.exports.getTitle = () => { return 'Disks' }
module.exports.getFields = async () => {
    const partitions = await si.fsSize()
    
    const fields = []

    for (const partitionindex in partitions) {
        
        const partition = partitions[partitionindex]

        const stringTemplate = JSON.stringify(template)

        const translatedTemplate = stringTemplate
            .replace(/(${partitionindex})/g, partitionindex)
            .replace(/(${partition.fs})/g, partition.fs)
            .replace(/(${partition.type})/g, partition.type)
            .replace(/(${partition.mount})/g, partition.mount)
            .replace(/(${partition.size})/g, `${(partition.size / (1024 ** 3)).toFixed(2)}GB`)
            .replace(/(${partition.used})/g, `${(partition.used / (1024 ** 3)).toFixed(2)}GB`)
        
        for (const index in JSON.parse(translatedTemplate)) {
            console.log(index)
            fields.push({
                name: index,
                value: translatedTemplate[index].value,
                inline: true
            })
        }
    }
    return fields
}