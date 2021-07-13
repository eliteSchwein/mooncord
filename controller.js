const migrationUtil = require('./utils/migrateUtil')
const core = require('./mooncord')

migrationUtil.execute()
core.start()