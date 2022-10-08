//import commandStructure from '../meta/command_structure.json'
import commandOptionsTypes from '../meta/command_option_types.json'
import {
    getEntry,
    getHeaterArguments,
    getHeaterChoices,
    getPreheatProfileChoices,
    getServiceChoices,
    setData
} from "../utils/CacheUtil";
import {LocaleHelper} from "../helper/LocaleHelper";
import {readFileSync} from "fs";
import path from "path";

export class DiscordCommandGenerator {
    protected localeHelper = new LocaleHelper()
    protected commandStructure = {}

    public getCommands() {
        const commandList = []
        const commandCache = {}
        const commandStructureFile = readFileSync(path.resolve(__dirname, '../src/meta/command_structure.json'))
        console.log('lol')
        this.commandStructure = JSON.parse(commandStructureFile.toString('utf8'))

        for (const commandIndex in this.commandStructure) {
            const command = this.buildCommand(commandIndex)
            commandList.push(command)
            commandCache[commandIndex] = command
        }

        setData('commands', commandCache)
        return commandList
    }

    public getCommandId(command:string) {
        const commandCache = getEntry('commands')

        for(const commandId in commandCache) {
            const commandData = commandCache[commandId]

            if(commandData.name === command) { return commandId}
        }
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