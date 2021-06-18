const locale = require('../localeUtil')

module.exports = {
  cpu: require('./cpu'),
  ram: require('./ram'),
  disk: require('./disk'),
  partitions: require('./partitions'),
  os: require('./os'),
}

module.exports.choices = () => {
    return [
        {
            name: locale.loadinfo.cpu.title,
            value: 'cpu'
        },
        {
            name: locale.loadinfo.ram.title,
            value: 'ram'
        },
        {
            name: locale.loadinfo.disk.title,
            value: 'disk'
        },
        {
            name: locale.loadinfo.partitions.title,
            value: 'partitions'
        },
        {
            name: locale.loadinfo.os.title,
            value: 'os'
        },
    ]
}
