export class DiscordCommandGenerator {
    public constructor() {
        const messageLocale = locale.commands[command]
        const syntaxLocale = locale.syntaxlocale.commands[command]

        const builder = {
            name: syntaxLocale.command,
            description: messageLocale.description,
            options: []
        }

        for(const index in commandOptions[command]) {
            this.buildCommandOption(
                builder,
                commandOptions[command],
                index,
                syntaxLocale,
                messageLocale)
        }

        return builder
    }

    protected buildCommandOption(builder, meta, option, syntaxMeta, messageMeta) {
        if (typeof(meta) === 'undefined') { return }

        const optionMeta = meta[option]

        if (typeof(optionMeta) === 'undefined') { return }
        if (Object.keys(optionMeta).length == 0) { return }

        const optionBuilder = {
            type: optionTypes[optionMeta.type],
            name: syntaxMeta.options[option].name,
            description: messageMeta.options[option].description,
            options: []
        }

        optionBuilder.required = optionMeta.required

        if (typeof (optionMeta.choices) !== 'undefined') {
            if (optionMeta.choices === '${loadInfoChoices}') {
                optionBuilder.choices = loadUtil.getComponents()
            } else {
                optionBuilder.choices = optionMeta.choices
            }
        }

        for(const index in meta[option].options) {
            buildCommandOption(
                optionBuilder,
                meta[option].options,
                index,
                syntaxMeta.options[option],
                messageMeta.options[option])
        }

        builder.options.push(optionBuilder)
    }
}