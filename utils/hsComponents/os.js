const si = require('systeminformation')

module.exports = {}
module.exports.getTitle = () => { return 'OS' }
module.exports.getFields = async () => {
  const os = await si.osInfo()
    
    return [{
        name: 'Plattform',
        value:`${os.platform}`,
        inline: true
    },{
        name: 'Logofile',
        value:`${os.logofile}`,
        inline: true
    },{
        name: 'Distro',
        value:`${os.distro}`,
        inline: true
    },{
        name: 'Release',
        value:`${os.release}`,
        inline: true
    },{
        name: 'Kernel',
        value:`${os.kernel}`,
        inline: true
    },{
        name: 'Arch',
        value:`${os.arch}`,
        inline: true
    },{
        name: 'Hostname',
        value:`${os.hostname}`,
        inline: true
    }]
}