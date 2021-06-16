const si = require('systeminformation')
const locale = require('../localeUtil')

module.exports = {}
module.exports.getTitle = () => { return locale.loadinfo.os.title }
module.exports.getFields = async () => {
  const os = await si.osInfo()
    
    return [{
        name: locale.loadinfo.os.platform,
        value:`${os.platform}`,
        inline: true
    },{
        name: locale.loadinfo.os.logofile,
        value:`${os.logofile}`,
        inline: true
    },{
        name: locale.loadinfo.os.distro,
        value:`${os.distro}`,
        inline: true
    },{
        name: locale.loadinfo.os.release,
        value:`${os.release}`,
        inline: true
    },{
        name: locale.loadinfo.os.kernel,
        value:`${os.kernel}`,
        inline: true
    },{
        name: locale.loadinfo.os.arch,
        value:`${os.arch}`,
        inline: true
    },{
        name: locale.loadinfo.os.hostname,
        value:`${os.hostname}`,
        inline: true
    }]
}