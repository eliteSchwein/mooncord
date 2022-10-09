import {logRegular} from "./LoggerHelper";
import {LocaleHelper} from "./LocaleHelper";
import {ConfigHelper} from "./ConfigHelper";
import {mergeDeep} from "./DataHelper";
import {getEntry, setData} from "../utils/CacheUtil";
import {TemplateHelper} from "./TemplateHelper";

export class ModalHelper {
    protected localeHelper = new LocaleHelper()
    protected configHelper = new ConfigHelper()
    protected templateHelper = new TemplateHelper()

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

    public async generateModal(modalID: string, providedPlaceholders = null) {
        return await this.templateHelper.parseTemplate('modal', modalID, providedPlaceholders)
    }
}