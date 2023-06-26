'use strict'

import {FileListHelper} from "../../../helper/FileListHelper";
import {getMoonrakerClient} from "../../../Application";
import {logNotice} from "../../../helper/LoggerHelper";

export class FileEditNotification {

    public parse(message) {
        if (typeof (message.method) === 'undefined') {
            return
        }
        if (typeof (message.params) === 'undefined') {
            return
        }

        if (message.method !== 'notify_filelist_changed') {
            return
        }

        const fileData = message.params[0]
        const fileListHelper = new FileListHelper()

        logNotice(`File ${fileData.item.path} changed: ${fileData.action}`)

        if (typeof fileData.source_item !== 'undefined') {
            logNotice(`Source File: ${fileData.source_item.path}`)
        }

        fileListHelper.retrieveFiles('config', 'config_files')
        fileListHelper.retrieveFiles('gcodes', 'gcode_files')
        fileListHelper.retrieveFiles('timelapse', 'timelapse_files', /(.*\.mp4)/g)
    }
}