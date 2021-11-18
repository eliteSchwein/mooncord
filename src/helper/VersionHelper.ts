import { findValue } from "../utils/CacheUtil";
import { LocaleHelper } from "./LocaleHelper";

export class VersionHelper {
    protected localeHelper = new LocaleHelper()
    protected locale = this.localeHelper.getLocale()

    public getFields() {
        const versionData = findValue('updates.version_info')
        const fields = []
        for (const component in versionData) {
            if (component !== 'system') {
                const componentdata = versionData[component]
                let {version, remote_version} = componentdata
                if (version !== remote_version) {
                    version = `${version} **(${remote_version})**`
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
        const versionData = findValue('updates.version_info')
        const fields = []
        for (const component in versionData) {
            if (component !== 'system') {
                fields.push({
                    name:component,
                    value:`${versionData[component].version} \n🆕 ${versionData[component].remote_version}`
                })
            } else {
                fields.push({
                    name:this.locale.embeds.fields.system,
                    value:`${this.locale.embeds.fields.packages}: ${versionData[component].package_count}`
                })
            }
        }
        return fields
    }
}