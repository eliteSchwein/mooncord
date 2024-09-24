'use strict'

import commandOptionsTypes from '../meta/command_option_types.json'
import {
    getEntry,
    getHeaterArguments,
    getHeaterChoices,
    getPowerDeviceChoices,
    getPreheatProfileChoices,
    getServiceChoices,
    setData
} from "../utils/CacheUtil";
import {LocaleHelper} from "../helper/LocaleHelper";
import {readFileSync} from "fs";
import path from "path";
import * as App from "../Application"
import {logError, logRegular} from "../helper/LoggerHelper";
import {ConfigHelper} from "../helper/ConfigHelper";
import {mergeDeep} from "../helper/DataHelper";
import {Routes} from "discord-api-types/v10"
import {RouteLike} from "@discordjs/rest";

export class DiscordCommandGenerator {

    public constructor() {
        const commandStructureFile = readFileSync(path.resolve(__dirname, '../src/meta/command_structure.json'))
        const commandStructure = JSON.parse(commandStructureFile.toString('utf8'))
        const customCommandStructure = this.getCustomCommandStructure()
        mergeDeep(commandStructure, customCommandStructure)

        setData('command_structure', commandStructure)
    }

    public getCustomCommandData(key: string) {
        const customCommandsConfig = new ConfigHelper().getEntriesByFilter(/^command /g, true)
        return customCommandsConfig[key]
    }

    public async registerCommands() {
        const rest = App.getDiscordClient().getRest()
        const commandList = []
        const commandCache = {}
        const commandStructureFile = readFileSync(path.resolve(__dirname, '../src/meta/command_structure.json'))
        const commandStructure = JSON.parse(commandStructureFile.toString('utf8'))
        const customCommandStructure = this.getCustomCommandStructure()
        mergeDeep(commandStructure, customCommandStructure)

        logRegular('get current commands...')
        const currentCommands = await rest.get(Routes.applicationCommands(App.getDiscordClient().getClient().user.id))
        const commandKeys = []

        for (const commandIndex in commandStructure) {
            let command: any
            if (Object.keys(customCommandStructure).includes(commandIndex)) {
                command = customCommandStructure[commandIndex]
            } else {
                command = this.buildCommand(commandIndex)
            }
            commandKeys.push(command.name)
            commandList.push(command)
            commandCache[commandIndex] = command

            logRegular(`Register Command ${command.name}...`)

            new Promise(async (resolve, reject) => {
                try {
                    await App.getDiscordClient().getClient().application?.commands?.create(command)
                } catch (e) {
                    logError(`An Error occured while registering the command ${command.name}`)
                    logError(`Reason: ${e}`)
                    logError(`Command Data: ${JSON.stringify(command, null, 4)}`)
                }
            })
        }

        // @ts-ignore
        for (const currentCommand of currentCommands) {
            if (!commandKeys.includes(currentCommand.name)) {
                logRegular(`Unregister Command ${currentCommand.name}...`)
                const deleteUrl = `${Routes.applicationCommands(App.getDiscordClient().getClient().user.id)}/${currentCommand.id}`;

                new Promise(async (resolve, reject) => {
                    try {
                        await rest.delete(<RouteLike>deleteUrl)
                    } catch (e) {
                        logError(`An Error occured while unregistering the command ${currentCommand.name}`)
                        logError(`Reason: ${e}`)
                        logError(`Command Data: ${JSON.stringify(currentCommand, null, 4)}`)
                    }
                })
            }
        }

        setData('commands', commandCache)
    }

    public getCommandId(command: string) {
        const commandCache = getEntry('commands')

        for (const commandId in commandCache) {
            const commandData = commandCache[commandId]

            if (commandData.name === command) {
                return commandId
            }
        }
    }

    public isCustomCommand(command: string) {
        return Object.keys(this.getCustomCommandStructure()).includes(command)
    }

    private getConfigStructure() {
        const commandStructureFile = readFileSync(path.resolve(__dirname, '../src/meta/command_structure.json'))
        return JSON.parse(commandStructureFile.toString('utf8'))
    }

    private buildCommand(command: string) {
        const localeHelper = new LocaleHelper()
        const messageLocale = Object.assign({}, localeHelper.getLocale().commands[command])
        const syntaxLocale = Object.assign({}, localeHelper.getSyntaxLocale().commands[command])
        const commandStructure = getEntry('command_structure')

        const builder = {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: []
        }

        for (const index in commandStructure[command]) {
            this.buildCommandOption(
                builder,
                commandStructure[command],
                index,
                syntaxLocale,
                messageLocale)
        }

        return builder
    }

    private buildChoices(choices: any, syntaxMeta: any) {
        for (const index in choices) {
            const choice = choices[index]

            if (typeof syntaxMeta !== 'undefined' &&
                typeof syntaxMeta[choice.value] !== 'undefined') {
                choice.name = syntaxMeta[choice.value]
            }

            choices[index] = choice
        }

        return choices
    }

    private buildCommandOption(builder: any, meta: any, option: any, syntaxMeta: any, messageMeta: any) {
        if (typeof (meta) === 'undefined') {
            return
        }

        const optionMeta = meta[option]

        if (typeof (optionMeta) === 'undefined') {
            return
        }
        if (Object.keys(optionMeta).length === 0) {
            return
        }

        if (optionMeta.options === '${heaterArguments}') {
            syntaxMeta.options[option].options = getHeaterArguments()
            messageMeta.options[option].options = getHeaterArguments()
            meta[option].options = getHeaterArguments()
            optionMeta.options = getHeaterArguments()
        }

        const optionBuilder = {
            type: commandOptionsTypes[optionMeta.type],
            name: syntaxMeta.options[option].name,
            description: messageMeta.options[option].description,
            options: [],
            required: false,
            choices: [],
            min_value: syntaxMeta.options[option].min_value,
            max_value: syntaxMeta.options[option].max_value
        }

        optionBuilder.required = optionMeta.required

        if (typeof (optionMeta.choices) !== 'undefined') {
            if (optionMeta.choices === '${systemInfoChoices}') {
                optionBuilder.choices = new LocaleHelper().getSystemComponents()
            } else if (optionMeta.choices === '${serviceChoices}') {
                optionBuilder.choices = getServiceChoices()
            } else if (optionMeta.choices === '${preheatProfileChoices}') {
                optionBuilder.choices = getPreheatProfileChoices()
            } else if (optionMeta.choices === '${powerDeviceChoices}') {
                optionBuilder.choices = getPowerDeviceChoices()
            } else if (optionMeta.choices === '${heaterChoices}') {
                optionBuilder.choices = getHeaterChoices()
            } else {
                optionBuilder.choices = this.buildChoices(optionMeta.choices, syntaxMeta.options[option].choices)
            }
        }

        for (const index in meta[option].options) {
            this.buildCommandOption(
                optionBuilder,
                meta[option].options,
                index,
                syntaxMeta.options[option],
                messageMeta.options[option])
        }

        builder.options.push(optionBuilder)
    }

    private getCustomCommandStructure() {
        const customCommandsConfig = new ConfigHelper().getEntriesByFilter(/^command /g, true)
        const customCommands = {}
        const commandStructure = this.getConfigStructure()

        for (const name of Object.keys(customCommandsConfig)) {
            if (Object.keys(commandStructure).includes(name)) {
                continue
            }

            const customCommandData = customCommandsConfig[name]
            if (customCommandData.macros === undefined && customCommandData.websocket_commands === undefined) {
                this.showCustomCommandError(`The Custom Command ${name} is invalid, it doesnt have any macros or websocket_commands configured!`)
                continue
            }
            const customCommandDescription = (customCommandData.description === null)
                ? new LocaleHelper().getLocale().messages.errors.custom_command_descript
                : customCommandData.description

            customCommands[name] = {
                'name': name,
                'description': customCommandDescription
            }
        }

        return customCommands
    }

    private showCustomCommandError(message: string) {
        const commandCache = getEntry('commands')
        if (commandCache === undefined || Object.keys(commandCache).length > 0) {
            return
        }
        logError(message)
    }
}