module.exports = {
  cpu: require('./cpu'),
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
    ]
}
