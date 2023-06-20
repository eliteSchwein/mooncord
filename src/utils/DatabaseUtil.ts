'use strict'

import {ConfigHelper} from '../helper/ConfigHelper'
import {logEmpty, logError, logRegular, logSuccess, logWarn} from '../helper/LoggerHelper'
import {getMoonrakerClient} from "../Application";
import path from "path";
import {writeFile} from "fs/promises";
import {mergeDeep} from "../helper/DataHelper";
import {getEntry} from "./CacheUtil";

const defaultDatabase = {
    'guilds': {},
    'notify': [],
    'permissions': {
        'controllers': [],
        'admins': {
            'roles': [],
            'users': []
        }
    },
    'invite_url': ''
}

let database: any = {}

export class DatabaseUtil {
    protected config = new ConfigHelper()
    protected moonrakerClient = getMoonrakerClient()

    public async retrieveDatabase() {
        logEmpty()
        logSuccess('Retrieve Database...')

        const databaseRequest = await this.moonrakerClient.send({
            "method": "server.database.get_item",
            "params": {"namespace": "mooncord", "key": "dataset"}
        })

        if (typeof databaseRequest.error !== 'undefined') {
            await this.handleDatabaseMissing()
            return
        }

        database = databaseRequest.result.value

        database = mergeDeep(JSON.parse(JSON.stringify(defaultDatabase)), database)

        if(Array.isArray(database.permissions.admins)) {
            database.permissions.admins = JSON.parse(JSON.stringify(defaultDatabase.permissions.admins))
        }

        await this.updateDatabase()
    }

    public async resetDatabase() {
        await this.handleDatabaseMissing()

        logWarn('Database wiped')

        await this.retrieveDatabase()
    }

    public async updateDatabase() {
        const updateRequest = await this.moonrakerClient.send({
            "method": "server.database.post_item",
            "params": {"namespace": "mooncord", "key": "dataset", "value": database}
        })

        if (typeof updateRequest.error !== 'undefined') {
            logError(`Database Update failed: ${updateRequest.error.message}`)
            return
        }

        if(getEntry('setup_mode')) {
            return
        }

        logSuccess('Database updated')
    }

    public getDatabaseEntry(key: string) {
        return database[key]
    }

    public async updateDatabaseEntry(key: string, value: any) {
        database[key] = value
        await this.updateDatabase()
    }

    public isReady() {
        return typeof database !== 'undefined'
    }

    public async dump() {
        void await this.writeDump()
        return database
    }

    protected async writeDump() {
        await writeFile(path.resolve(__dirname, '../database_dump.json'), JSON.stringify(database, null, 4), {
            encoding: 'utf8',
            flag: 'w+'
        })
        logSuccess('Dumped Database!')
    }

    private async handleDatabaseMissing() {
        logRegular('generate Database Structure...')

        database = Object.assign({}, defaultDatabase)

        await this.updateDatabase()
    }
}