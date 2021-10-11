import {readFileSync} from 'fs'

const args = process.argv.slice(2)

export class ConfigHelper {
    protected configPath = `${args[0]}/mooncord.json`
    protected configRaw = readFileSync(this.configPath, {encoding: 'utf8'})
    protected config = JSON.parse(this.configRaw)

    public getMoonrakerSocketUrl() {
        return this.config.connection.moonraker_socket_url
    }

    public getMoonrakerUrl() {
        return this.config.connection.moonraker_url
    }

    public getMoonrakerApiKey() {
        return this.config.connection.moonraker_token
    }

    public getMoonrakerDatabaseNamespace() {
        return this.config.connection.moonraker_database
    }

    public getDiscordToken() {
        return this.config.connection.bot_token
    }

    public getStatusInterval() {
        return this.config.status.update_interval
    }

    public getStatusMinInterval() {
        return this.config.status.min_interval
    }

    public isStatusPerPercent() {
        return this.config.status.use_percent
    }

    public getStatusBeforeTasks() {
        return this.config.status.before
    }

    public getStatusAfterTasks() {
        return this.config.status.before
    }

    public getLocale() {
        return this.config.language.messages
    }

    public getSyntaxLocale() {
        return this.config.language.command_syntax
    }

    public isButtonSyntaxLocale() {
        return this.config.language.buttons_use_syntax_locale
    }

    public getWebcamUrl() {
        return this.config.webcam.url
    }

    public getWebcamQuality() {
        return this.config.webcam.quality
    }

    public getWebcamBrightness() {
        return this.config.webcam.brightness
    }

    public getWebcamContrast() {
        return this.config.webcam.contrast
    }

    public isWebcamVerticalMirrored() {
        return this.config.webcam.vertical_mirror
    }

    public isWebcamHorizontalMirrored() {
        return this.config.webcam.horizontal_mirror
    }

    public isWebcamGreyscale() {
        return this.config.webcam.greyscale
    }

    public isWebcamSepia() {
        return this.config.webcam.sepia
    }

    public notifyOnMoonrakerThrottle() {
        return this.config.system_notifications.moonraker_throttle
    }
}