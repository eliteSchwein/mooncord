import { getEntry } from "../utils/CacheUtil";

export class VersionHelper {
    public getFields() {
        const updateCache = getEntry('updates')
        const fields = []
        for (const component in updateCache.version_info) {
            if (component !== 'system') {
                const componentdata = updateCache.version_info[component]
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
}