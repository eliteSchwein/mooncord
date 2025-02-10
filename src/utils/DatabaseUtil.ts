'use strict'

import {ConfigHelper} from '../helper/ConfigHelper'
import {logEmpty, logError, logRegular, logSuccess, logWarn} from '../helper/LoggerHelper'
import {getMoonrakerClient} from "../Application";
import path from "path";
import {writeFile} from "fs/promises";
import {mergeDeep, sleep} from "../helper/DataHelper";
import {getEntry} from "./CacheUtil";
import util from "util";

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
    protected currentRetry = 0
    protected retryLimit = 0

    public constructor() {
        this.retryLimit = this.config.getMoonrakerDatabaseRetryLimit()
    }

    public async retrieveDatabase() {
        logEmpty()

        try {
            logSuccess('Check if Database is present...')

            const databaseNamespaces = await this.moonrakerClient.send({
                "method": "server.database.list"
            })

            console.log(databaseNamespaces)

            if(!databaseNamespaces.includes("mooncord")) {
                await this.handleDatabaseMissing()
                return
            }

            logSuccess('Retrieve Database...')

            const databaseRequest = await this.moonrakerClient.send({
                "method": "server.database.get_item",
                "params": {"namespace": "mooncord", "key": "dataset"}
            })

            if (typeof databaseRequest.error !== 'undefined') {
                throw new Error(databaseRequest.error)
            }

            database = databaseRequest.result.value

            database = mergeDeep(JSON.parse(JSON.stringify(defaultDatabase)), database)

            if (Array.isArray(database.permissions.admins)) {
                database.permissions.admins = JSON.parse(JSON.stringify(defaultDatabase.permissions.admins))
            }

            this.currentRetry = 0
        } catch (error) {
            this.currentRetry += 1

            if(this.currentRetry > this.retryLimit) {
                logError(`Couldn't retrieve data from database, stopping MoonCord now!`)
                process.exit(5)
            }

            logWarn(`Couldn't retrieve data from database, retry ${this.currentRetry} of ${this.retryLimit} in 5 seconds. Reason: ${util.format(error)}`)

            await sleep(5_000)

            await this.retrieveDatabase()
        }
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

        if (getEntry('setup_mode')) {
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

    private async writeDump() {
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