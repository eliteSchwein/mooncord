import { findValue } from "../utils/CacheUtil";
import { LocaleHelper } from "./LocaleHelper";

export class VersionHelper {
    protected versionData = findValue('updates.version_info')
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public getFields() {
        const fields = []
        for (const component in this.versionData) {
            if (component !== 'system') {
                const componentdata = this.versionData[component]
                let {version} = componentdata
                if (version !== componentdata.remote_version) {
                    version = version.concat(` **(${componentdata.remote_version})**`)
                }
                fields.push({
                    name:component,
                    value:version
                })
            }
        }
        return fields
    }

    public getUpdateFields() {
        const fields = []
        for (const component in this.versionData) {
            if (component !== 'system') {
                fields.push({
                    name:component,
                    value:`${this.versionData[component].version} \n🆕 ${this.versionData[component].remote_version}`
                })
            } else {
                fields.push({
                    name:this.locale.embeds.fields.system,
                    value:`${this.locale.embeds.fields.packages}: ${this.versionData[component].package_count}`
                })
            }
        }
        return fields
    }
}