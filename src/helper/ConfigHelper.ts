import {readFileSync, writeFileSync} from 'fs'
import path from "path";
import {mergeDeep} from "./DataHelper";
import {getEntry, setData, updateData} from "../utils/CacheUtil";
import {logRegular} from "./LoggerHelper";

const args = process.argv.slice(2)

export class ConfigHelper {
    protected configPath = `${args[0]}/mooncord.json`

    public loadCache() {
        logRegular("load Config Cache...")
        const defaultConfig = readFileSync(path.resolve(__dirname, '../../scripts/mooncord_full.json'), {encoding: 'utf8'})

        const config = JSON.parse(defaultConfig)
        mergeDeep(config, this.getUserConfig())
        setData('config', config)
    }

    public getConfig() {
        return getEntry('config')
    }

    public getUserConfig() {
        return JSON.parse(readFileSync(this.configPath, {encoding: 'utf8'}))
    }

    public writeUserConfig(modifiedConfig) {
        updateData('config', modifiedConfig)

        writeFileSync(this.configPath, JSON.stringify(modifiedConfig, null, 4), {encoding: 'utf8', flag: 'w+'})
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
        return this.getConfig().notifications.moonraker_throttle
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

    public getIconSet() {
        return this.getConfig().messages.icon_set
    }

    public getEmbedMeta() {
        return this.getConfig().embed_meta
    }

    public getModalMeta() {
        return this.getConfig().modal_meta
    }

    public getInputMeta() {
        return this.getConfig().input_meta
    }

    public getStatusMeta() {
        return this.getConfig().status_meta
    }

    public getTempMeta() {
        return this.getConfig().temp_meta
    }

    public getDateLocale() {
        return this.getConfig().language.date_locale
    }

    public getDiscordRequestTimeout() {
        return this.getConfig().discord.request_timeout
    }

    public getEntriesPerPage() {
        return this.getConfig().messages.entries_per_page
    }

    public traceOnWebErrors() {
        return this.getConfig().development.trace_on_web_error
    }

    public getMoonrakerRetryInterval() {
        return this.getConfig().connection.moonraker_retry_interval
    }

    public notifyOnTimelapseFinish() {
        return this.getConfig().notifications.timelapse
    }

    public useDevDatabase() {
        return this.getConfig().development.dev_database
    }

    public showM117Notifcation() {
        return this.getConfig().notifications.show_m117_notification
    }

    public getGcodeExecuteTimeout() {
        return this.getConfig().status.gcode_timeout
    }

    public getGraphConfig(graph: string) {
        return this.getConfig().graph_meta[graph]
    }

    public getGraphService() {
        return this.getConfig().graph.service
    }
}