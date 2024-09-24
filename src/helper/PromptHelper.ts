import {logNotice, logRegular, logWarn} from "./LoggerHelper";
import {getEntry, setData} from "../utils/CacheUtil";
import {NotificationHelper} from "./NotificationHelper";
import {PermissionHelper} from "./PermissionHelper";
import {ConfigHelper} from "./ConfigHelper";
import {LocaleHelper} from "./LocaleHelper";
import {ConsoleHelper} from "./ConsoleHelper";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Interaction} from "discord.js";
import {convertStyle} from "./DataHelper";

export class PromptHelper {
    public loadCache() {
        logRegular("load Prompt Cache...")

        setData('prompt', {
            timeout: 0,
            group_active: false,
            components: []
        })
    }

    public async handePromptGcodeButton(gcode: string, interaction: Interaction) {
        if (!interaction.isButton()) {
            return
        }

        const config = new ConfigHelper()
        const permissionHelper = new PermissionHelper()
        const localeHelper = new LocaleHelper()
        const consoleHelper = new ConsoleHelper()

        if(!permissionHelper.isBotAdmin(interaction.user, interaction.guild) && !permissionHelper.isController(interaction.user, interaction.guild)) {
            await interaction.reply({
                content: localeHelper.getNoPermission(interaction.user.tag),
                ephemeral: config.showNoPermissionPrivate()
            })
            logWarn(`${interaction.user.tag} doesnt have the permission for: ${interaction.customId}`)
            return;
        }

        await consoleHelper.executeGcodeCommands([gcode],
            interaction.channel,
            true)

        if (!interaction.replied) {
            await interaction.deferUpdate()
        }
    }

    public purgePrompt() {
        const cache = getEntry('prompt')

        if(cache.timeout === 0) {
            return
        }

        if(cache.components.length === 0) {
            cache.timeout = 0
        } else {
            cache.timeout--
        }

        setData('prompt', cache)
    }

    private showPrompt(content: any) {
        const embed = new EmbedBuilder()
        const message = {embeds: [], components: []}
        let currentRow = new ActionRowBuilder()

        for(const component of content.components) {
            switch (component.type) {
                case "title":
                    logNotice(`open prompt ${component.label}...`)
                    embed.setTitle(component.label)
                    break
                case "description":
                    embed.setDescription(component.label)
                    break
                case "button_group":
                    if(currentRow.components.length > 0) {
                        message.components.push(currentRow)
                    }

                    const buttonGroup = new ActionRowBuilder()
                    currentRow = new ActionRowBuilder()

                    for(const buttonComponent of component.components) {
                        const button = new ButtonBuilder()

                        button.setStyle(convertStyle(buttonComponent.style))
                        button.setLabel(buttonComponent.label)
                        button.setCustomId(`prompt_gcode|${buttonComponent.gcode}`)

                        buttonGroup.addComponents(button)
                    }

                    message.components.push(buttonGroup)

                    break
                case "button":
                    const button = new ButtonBuilder()

                    button.setStyle(convertStyle(component.style))
                    button.setLabel(component.label)
                    button.setCustomId(`prompt_gcode|${component.gcode}`)

                    if(currentRow.components.length > 4) {
                        message.components.push(currentRow)
                        currentRow = new ActionRowBuilder()
                    }

                    currentRow.addComponents(button)
            }
        }

        if(currentRow.components.length > 0) {
            message.components.push(currentRow)
        }


        message.embeds.push(embed)

        const notificationHelper = new NotificationHelper()

        void notificationHelper.broadcastMessage(message)
    }

    public addComponent(content: string) {
        const cache = getEntry('prompt')
        const commandIndex = content.indexOf(' ')

        let command = content.substring(0, commandIndex)
        const attributes = content.substring(commandIndex + 1)

        if(commandIndex === -1) {
            command = content
        }

        command = command.replace(/^(footer_)/,'')

        switch (command) {
            case 'show':
                this.showPrompt(cache)
                this.loadCache()
                break
            case 'begin':
                cache.timeout = 10
                cache.components.push({
                    type: 'title',
                    label: attributes
                })
                break
            case 'text':
                cache.components.push({
                    type: 'description',
                    label: attributes
                })
                break
            case 'button_group_start':
                cache.group_active = true
                cache.components.push({
                    type: 'button_group',
                    components: []
                })
                break
            case 'button_group_end':
                cache.group_active = false
                break
            case 'button':
                const buttonPartials = attributes.split('|')
                const buttonComponent = {
                    type: 'button',
                    label: buttonPartials[0],
                    gcode: buttonPartials[1],
                    style: buttonPartials[2]
                }

                if(cache.group_active) {
                    const groupIndex = cache.components.length - 1
                    const groupComponent = cache.components[groupIndex]

                    groupComponent.components.push(
                        buttonComponent
                    )

                    cache.components[groupIndex] = groupComponent
                } else {
                    cache.components.push(buttonComponent)
                }
                break
        }

        setData('prompt', cache)
    }
}