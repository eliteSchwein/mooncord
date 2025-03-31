import {ActivityType, TextInputStyle} from "discord.js";

export function convertActivityStyle(type: string) {
    if (!type) {
        return ActivityType.Custom
    }
    type = type.trim().toUpperCase()
    return ActivityType[type.charAt(0) + type.substring(1).toLowerCase()]
}