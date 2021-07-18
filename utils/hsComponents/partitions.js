const si = require('systeminformation')

const locale = require('../localeUtil')

const template = {
    "name": {
        "title": locale.loadinfo.partitions.name,
        "value":  "${partition.fs}"
    },
    "type": {
        "title": locale.loadinfo.partitions.type,
        "value":  "${partition.type}"
    },
    "mount": {
        "title": locale.loadinfo.partitions.mount,
        "value":  "${partition.mount}"
    },
    "size": {
        "title": locale.loadinfo.partitions.size,
        "value":  "${partition.size}"
    },
    "used": {
        "title": locale.loadinfo.partitions.used,
        "value":  "${partition.used}"
    },
}

module.exports = {}
module.exports.getTitle = () => { return locale.loadinfo.partitions.title }
module.exports.getFields = async () => {
    const partitions = await si.fsSize()
    
    const fields = []

    for (const partitionindex in partitions) {
        
        const partition = partitions[partitionindex]

        const stringTemplate = JSON.stringify(template)

        const translatedTemplate = stringTemplate
            .replace(/(\${partition_index})/g, partitionindex)
            .replace(/(\${partition.fs})/g, partition.fs)
            .replace(/(\${partition.type})/g, partition.type)
            .replace(/(\${partition.mount})/g, partition.mount)
            .replace(/(\${partition.size})/g, `${(partition.size / (1024 ** 3)).toFixed(2)}GB`)
            .replace(/(\${partition.used})/g, `${(partition.used / (1024 ** 3)).toFixed(2)}GB`)
        
        const translatedJSONTemplate = JSON.parse(translatedTemplate)
        
        for (const index in translatedJSONTemplate) {
            fields.push({
                name: translatedJSONTemplate[index].title,
                value: translatedJSONTemplate[index].value,
                inline: true
            })
        }
    }
    return fields
}