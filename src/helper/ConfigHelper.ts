import {readFileSync} from 'fs'
import path from "path";
import {mergeDeep} from "./DataHelper";
import {getEntry, setData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";

const args = process.argv.slice(2)

export class ConfigHelper {

    public constructor() {
    }

    public loadCache() {
        logRegular("load Config Cache...")
        const configPath = `${args[0]}/mooncord.json`
        const configRaw = readFileSync(configPath, {encoding: 'utf8'})
        const defaultConfig = readFileSync(path.resolve(__dirname, '../../scripts/mooncord_full.json'), {encoding: 'utf8'})

        const config = JSON.parse(defaultConfig)
        mergeDeep(config, JSON.parse(configRaw))
        setData('config', config)
    }

    public getConfig() {
        return getEntry('config')
    }
    
    public getPermissions() {
        return this.getConfig().permission
    }

    public getMoonrakerSocketUrl() {
        return this.getConfig().connection.moonraker_socket_url
    }

    public getMoonrakerUrl() {
        return this.getConfig().connection.moonraker_url
    }

    public getMoonrakerApiKey() {
        return this.getConfig().connection.moonraker_token
    }

    public getDiscordToken() {
        return this.getConfig().connection.bot_token
    }

    public getStatusInterval() {
        return this.getConfig().status.update_interval
    }

    public getStatusMinInterval() {
        return this.getConfig().status.min_interval
    }

    public isStatusPerPercent() {
        return this.getConfig().status.use_percent
    }

    public getStatusBeforeTasks() {
        return this.getConfig().status.before
    }

    public getStatusAfterTasks() {
        return this.getConfig().status.before
    }

    public getLocale() {
        return this.getConfig().language.messages
    }

    public getSyntaxLocale() {
        return this.getConfig().language.command_syntax
    }

    public isButtonSyntaxLocale() {
        return this.getConfig().language.buttons_use_syntax_locale
    }

    public getWebcamUrl() {
        return this.getConfig().webcam.url
    }

    public getWebcamQuality() {
        return this.getConfig().webcam.quality
    }

    public getWebcamBrightness() {
        return this.getConfig().webcam.brightness
    }

    public getWebcamRotation() {
        return this.getConfig().webcam.rotation
    }

    public getWebcamContrast() {
        return this.getConfig().webcam.contrast
    }

    public isWebcamVerticalMirrored() {
        return this.getConfig().webcam.vertical_mirror
    }

    public isWebcamHorizontalMirrored() {
        return this.getConfig().webcam.horizontal_mirror
    }

    public isWebcamGreyscale() {
        return this.getConfig().webcam.greyscale
    }

    public isWebcamSepia() {
        return this.getConfig().webcam.sepia
    }

    public notifyOnMoonrakerThrottle() {
        return this.getConfig().system_notifications.moonraker_throttle
    }

    public dumpCacheOnStart() {
        return this.getConfig().development.dump_cache_on_start
    }

    public showNoPermissionPrivate() {
        return this.getConfig().messages.show_no_permission_private
    }

    public getLogPath() {
        return this.getConfig().logger.path
    }

    public isLogFileDisabled() {
        return this.getConfig().logger.disable_file
    }

    public getTempPath() {
        return this.getConfig().tmp_path
    }

    public getModerateSchedulerInterval() {
        return this.getConfig().scheduler.moderate_interval
    }

    public getHighSchedulerInterval() {
        return this.getConfig().scheduler.high_interval
    }
}