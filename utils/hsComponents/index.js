const locale = require('../localeUtil')

const syntaxLocale = locale.syntaxlocale

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
            name: syntaxLocale.loadinfo.cpu.title,
            value: 'cpu'
        },
        {
            name: syntaxLocale.loadinfo.ram.title,
            value: 'ram'
        },
        {
            name: syntaxLocale.loadinfo.disk.title,
            value: 'disk'
        },
        {
            name: syntaxLocale.loadinfo.partitions.title,
            value: 'partitions'
        },
        {
            name: syntaxLocale.loadinfo.os.title,
            value: 'os'
        },
    ]
}
