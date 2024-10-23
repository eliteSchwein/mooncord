'use strict'

import {FileListHelper} from "../../../helper/FileListHelper";
import {logNotice} from "../../../helper/LoggerHelper";
import {HistoryHelper} from "../../../helper/HistoryHelper";

export class HistoryUpdateNotification {

    public async parse(message) {
        if (typeof (message.method) === 'undefined') {
            return false
        }

        if (message.method !== 'notify_history_changed') {
            return false
        }

        const historyHelper = new HistoryHelper()

        await historyHelper.parseData()

        return true
    }
}