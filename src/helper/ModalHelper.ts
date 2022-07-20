import {logRegular} from "./LoggerHelper";
import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {DiscordInputGenerator} from "../generator/DiscordInputGenerator";
import {mergeDeep} from "./DataHelper";
import {getEntry, setData} from "../utils/CacheUtil";

export class ModalHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected inputGenerator = new DiscordInputGenerator()

    public loadCache() {
        logRegular("load Modals Cache...")
        const modals = this.configHelper.getModalMeta()
        const modalsMeta = this.localeHelper.getModals()

        mergeDeep(modals, modalsMeta)

        setData('modals', modals)
    }

    public getModals() {
        return getEntry('modals')
    }
}