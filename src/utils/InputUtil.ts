import {ButtonStyle, TextInputStyle} from "discord.js";

export function parseData(input: string) {
    if(input === 'true') return true
    if(input === 'false') return false

    const parsedNumber = Number.parseFloat(input)

    if(!isNaN(parsedNumber) && isFinite(parsedNumber)) return parsedNumber

    return input
}

export function convertButtonStyle(style: string) {
    if (!style) {
        return ButtonStyle.Secondary
    }
    style = style.trim().toUpperCase()
    switch (style) {
        case "INFO":
            return ButtonStyle.Primary
        case "WARNING":
        case "ERROR":
            return ButtonStyle.Danger
        default:
            return ButtonStyle[style.charAt(0) + style.substring(1).toLowerCase()]
    }
}

export function convertTextInputStyle(type: string) {
    if (!type) {
        return TextInputStyle.Paragraph
    }
    type = type.trim().toUpperCase()
    return TextInputStyle[type.charAt(0) + type.substring(1).toLowerCase()]
}