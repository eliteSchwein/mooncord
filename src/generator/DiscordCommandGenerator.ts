import commandOptionsTypes from '../meta/command_option_types.json'
import {
    getEntry,
    getHeaterArguments,
    getHeaterChoices, getPowerDeviceChoices,
    getPreheatProfileChoices,
    getServiceChoices,
    setData
} from "../utils/CacheUtil";
import {LocaleHelper} from "../helper/LocaleHelper";
import {readFileSync} from "fs";
import path from "path";
import * as App from "../Application"
import {logError, logRegular, logSuccess, logWarn} from "../helper/LoggerHelper";
import {ConfigHelper} from "../helper/ConfigHelper";
import {mergeDeep} from "../helper/DataHelper";
import {Routes} from "discord-api-types/v10"

export class DiscordCommandGenerator {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected locale = this.localeHelper.getLocale()
    protected commandStructure = {}
    protected customCommandStructure = {}

    public constructor() {
        const commandStructureFile = readFileSync(path.resolve(__dirname, '../src/meta/command_structure.json'))
        this.commandStructure = JSON.parse(commandStructureFile.toString('utf8'))
        this.customCommandStructure = this.getCustomCommandStructure()
        mergeDeep(this.commandStructure, this.customCommandStructure)
    }

    public getCustomCommandData(key: string) {
        const customCommandsConfig = this.configHelper.getCustomCommands()
        return customCommandsConfig[key]
    }

    public async registerCommands() {
        const rest = App.getDiscordClient().getRest()
        const commandList = []
        const commandCache = {}
        const commandStructureFile = readFileSync(path.resolve(__dirname, '../src/meta/command_structure.json'))
        this.commandStructure = JSON.parse(commandStructureFile.toString('utf8'))
        this.customCommandStructure = this.getCustomCommandStructure()
        mergeDeep(this.commandStructure, this.customCommandStructure)

        logRegular('get current commands...')
        const currentCommands = await rest.get(Routes.applicationCommands(App.getDiscordClient().getClient().user.id))
        const commandKeys = []

        for (const commandIndex in this.commandStructure) {
            let command: any
            if(Object.keys(this.customCommandStructure).includes(commandIndex)) {
                command = this.customCommandStructure[commandIndex]
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

        for(const currentCommand of currentCommands) {
            if(!commandKeys.includes(currentCommand.name)) {
                logRegular(`Unregister Command ${currentCommand.name}...`)
                const deleteUrl = `${Routes.applicationCommands(App.getDiscordClient().getClient().user.id)}/${currentCommand.id}`;

                new Promise(async (resolve, reject) => {
                    try {
                        await rest.delete(deleteUrl)
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

    private getCustomCommandStructure() {
        const customCommandsConfig = this.configHelper.getCustomCommands()
        const customCommands = {}

        for(const name of Object.keys(customCommandsConfig)) {
            if(Object.keys(this.commandStructure).includes(name)) {
                this.showCustomCommandError(`The Custom Command ${name} is invalid, you cant overwrite existing commands!`)
                continue
            }
            const customCommandData = customCommandsConfig[name]
            if(customCommandData.macros === undefined && customCommandData.websocket_commands === undefined) {
                this.showCustomCommandError(`The Custom Command ${name} is invalid, it doesnt have any macros or websocket_commands configured!`)
                continue
            }
            const customCommandDescription = (customCommandData.description === null || customCommandData.description === null)
                ? this.locale.messages.errors.custom_command_descript
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
        if(commandCache === undefined || Object.keys(commandCache).length > 0) {
            return
        }
        logError(message)
    }

    public getCommandId(command:string) {
        const commandCache = getEntry('commands')

        for(const commandId in commandCache) {
            const commandData = commandCache[commandId]

            if(commandData.name === command) { return commandId}
        }
    }

    public isCustomCommand(command:string) {
        return Object.keys(this.customCommandStructure).includes(command)
    }

    protected buildCommand(command:string) {
        const messageLocale = Object.assign({}, this.localeHelper.getLocale().commands[command])
        const syntaxLocale = Object.assign({}, this.localeHelper.getSyntaxLocale().commands[command])

        const builder = {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: []
        }

        for(const index in this.commandStructure[command]) {
            this.buildCommandOption(
                builder,
                this.commandStructure[command],
                index,
                syntaxLocale,
                messageLocale)
        }

        return builder
    }

    protected buildChoices(choices: any, syntaxMeta: any) {
        for(const index in choices) {
            const choice = choices[index]

            if(typeof syntaxMeta !== 'undefined' &&
                typeof syntaxMeta[choice.value] !== 'undefined') {
                choice.name = syntaxMeta[choice.value]
            }

            choices[index] = choice
        }

        return choices
    }

    protected buildCommandOption(builder:any, meta:any, option:any, syntaxMeta:any, messageMeta:any) {
        if (typeof(meta) === 'undefined') { return }

        const optionMeta = meta[option]

        if (typeof(optionMeta) === 'undefined') { return }
        if (Object.keys(optionMeta).length === 0) { return }

        if(optionMeta.options === '${heaterArguments}') {
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
                optionBuilder.choices = this.localeHelper.getSystemComponents()
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

        for(const index in meta[option].options) {
            this.buildCommandOption(
                optionBuilder,
                meta[option].options,
                index,
                syntaxMeta.options[option],
                messageMeta.options[option])
        }

        builder.options.push(optionBuilder)
    }
}