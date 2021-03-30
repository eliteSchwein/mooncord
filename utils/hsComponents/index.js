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
            name: 'CPU',
            value: 'cpu'
        },
        {
            name: 'RAM',
            value: 'ram'
        },
        {
            name: 'Disks',
            value: 'disk'
        },
        {
            name: 'Paritions',
            value: 'partitions'
        },
        {
            name: 'OS',
            value: 'os'
        },
    ]
}
