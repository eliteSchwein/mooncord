const si = require('systeminformation')
const locale = require('../localeUtil')

const template = {
    "name": {
        "title": locale.loadinfo.disk.name,
        "value":  "${disk.device}"
    },
    "type": {
        "title": locale.loadinfo.disk.type,
        "value":  "${disk.type}"
    },
    "model": {
        "title": locale.loadinfo.disk.model,
        "value":  "${disk.name}"
    },
    "vendor": {
        "title": locale.loadinfo.disk.vendor,
        "value":  "${disk.vendor}"
    },
    "used": {
        "title": locale.loadinfo.disk.size,
        "value":  "${disk.size}"
    },
}

module.exports = {}
module.exports.getTitle = () => { return locale.loadinfo.disk.title }
module.exports.getFields = async () => {
    const disks = await si.diskLayout()
    
    const fields = []

    for (const diskindex in disks) {
        
        const disk = disks[diskindex]

        if (String(disk.device).includes('/dev/ram')) { return }

        const stringTemplate = JSON.stringify(template)

        const translatedTemplate = stringTemplate
            .replace(/(\${disk_index})/g, diskindex)
            .replace(/(\${disk.device})/g, disk.device)
            .replace(/(\${disk.type})/g, disk.type)
            .replace(/(\${disk.name})/g, disk.name)
            .replace(/(\${disk.vendor})/g, disk.vendor)
            .replace(/(\${disk.size})/g, `${(disk.size / (1024 ** 3)).toFixed(2)}GB`)
        
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