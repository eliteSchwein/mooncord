const si = require('systeminformation')

const template = {
    "Disk ${diskindex} Name": {
        "value":  "${disk.device}"
    },
    "Disk ${diskindex} Type": {
        "value":  "${disk.type}"
    },
    "Disk ${diskindex} Model": {
        "value":  "${disk.name}"
    },
    "Disk ${diskindex} Vendor": {
        "value":  "${disk.vendor}"
    },
    "Disk ${diskindex} Used": {
        "value":  "${disk.size}"
    },
}

module.exports = {}
module.exports.getTitle = () => { return 'Disks' }
module.exports.getFields = async () => {
    const disks = await si.diskLayout()
    
    const fields = []

    for (const diskindex in disks) {
        
        const disk = disks[diskindex]

        if (String(disk.device).includes('/dev/ram')) { return }

        const stringTemplate = JSON.stringify(template)

        const translatedTemplate = stringTemplate
            .replace(/(\${diskindex})/g, diskindex)
            .replace(/(\${disk.device})/g, disk.device)
            .replace(/(\${disk.type})/g, disk.type)
            .replace(/(\${disk.name})/g, disk.name)
            .replace(/(\${disk.vendor})/g, disk.vendor)
            .replace(/(\${disk.size})/g, `${(partition.size / (1024 ** 3)).toFixed(2)}GB`)
        
        const translatedJSONTemplate = JSON.parse(translatedTemplate)
        
        for (const index in translatedJSONTemplate) {
            fields.push({
                name: index,
                value: translatedJSONTemplate[index].value,
                inline: true
            })
        }
    }
    return fields
}