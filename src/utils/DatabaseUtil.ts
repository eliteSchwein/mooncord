import {ConfigHelper} from '../helper/ConfigHelper'
import {waitUntil} from 'async-wait-until'
import {logEmpty, logError, logRegular, logSuccess} from '../helper/ConsoleLogger'
import {MoonrakerClient} from '../clients/MoonrakerClient'

const defaultDatabase = {
    'guilds': {},
    'notify': ['']
}

let database:any

export class DatabaseUtil {
    protected config = new ConfigHelper()
    protected moonrakerClient: MoonrakerClient
    protected namespace = this.config.getMoonrakerDatabaseNamespace()

    public constructor(moonrakerClient: MoonrakerClient) {
        this.moonrakerClient = moonrakerClient
        this.retrieveDatabase()
    }

    private async retrieveDatabase() {
        await waitUntil(() => this.moonrakerClient.isReady(), { timeout: Number.POSITIVE_INFINITY, intervalBetweenAttempts: 500 })

        logEmpty()
        logSuccess('retrieve Database...')

        const databaseRequest = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "server.database.get_item", "params": { "namespace": "${this.namespace}", "key": "dataset"}}`)

        if(typeof databaseRequest.error !== 'undefined') {
            await this.handleDatabaseMissing()
            return
        }

        database = databaseRequest.result.value
    }

    private async handleDatabaseMissing() {
        logRegular('generate Database Structure...')
        
        database = defaultDatabase

        await this.updateDatabase()
    }

    public async updateDatabase() {
        const updateRequest = await this.moonrakerClient.send(`{"jsonrpc": "2.0", "method": "server.database.post_item", "params": { "namespace": "${this.namespace}", "key": "dataset", "value": ${JSON.stringify(defaultDatabase)}}}`)

        if(typeof updateRequest.error !== 'undefined') {
            logError(`Database Update failed: ${updateRequest.error.message}`)
            return
        }

        logSuccess('Database updated')
    }
    
    public getDatabaseEntry(key:string) {
        return database[key]
    }

    public updateDatabaseEntry(key:string, value:any) {
        database[key] = value
        this.updateDatabase()
    }

    public isReady() {
        return typeof database !== 'undefined'
    }
}