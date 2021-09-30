import {ConfigHelper} from "../helper/ConfigHelper";

import commandStructure from '../meta/command_structure.json'
import commandOptionsTypes from '../meta/command_option_types.json'
import {getLocaleHelper} from "../Application";

export class DiscordCommandGenerator {
    protected config = new ConfigHelper()
    protected localeHelper = getLocaleHelper()
    protected commandList = []

    public constructor() {
        for (const commandIndex in commandStructure) {

            const command = this.buildCommand(commandIndex)
            this.commandList.push(command)
        }
    }

    public getCommands() {
        return this.commandList
    }

    protected buildCommand(command:string) {
        const messageLocale = this.localeHelper.getLocale().commands[command]
        const syntaxLocale = this.localeHelper.getSyntaxLocale().commands[command]

        const builder = {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: []
        }

        for(const index in commandStructure[command]) {
            this.buildCommandOption(
                builder,
                commandStructure[command],
                index,
                syntaxLocale,
                messageLocale)
        }

        return builder
    }

    protected buildCommandOption(builder:any, meta:any, option:any, syntaxMeta:any, messageMeta:any) {
        if (typeof(meta) === 'undefined') { return }

        const optionMeta = meta[option]

        if (typeof(optionMeta) === 'undefined') { return }
        if (Object.keys(optionMeta).length === 0) { return }

        const optionBuilder = {
            type: commandOptionsTypes[optionMeta.type],
            name: syntaxMeta.options[option].name,
            description: messageMeta.options[option].description,
            options: [],
            required: false,
            choices: []
        }

        optionBuilder.required = optionMeta.required

        if (typeof (optionMeta.choices) !== 'undefined') {
            if (optionMeta.choices === '${loadInfoChoices}') {
               // optionBuilder.choices = loadUtil.getComponents()
            } else {
                optionBuilder.choices = optionMeta.choices
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