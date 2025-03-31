import {ConfigHelper} from "../helper/ConfigHelper";
import axios from "axios";
import {Attachment} from "discord.js";
import {logError, logNotice} from "../helper/LoggerHelper";
import FormData from "form-data";

export async function downloadFile(root: string, fileName: string) {
    const config = new ConfigHelper()

    const result = await axios.get(`${config.getMoonrakerUrl()}/server/files/${root}/${fileName}`, {
        responseType: 'arraybuffer',
        headers: {
            'X-Api-Key': config.getMoonrakerApiKey()
        }
    })

    const bufferSize = Buffer.byteLength(<Buffer>result.data)

    return {
        size: bufferSize,
        data: <Buffer>result.data,
        overSizeLimit: bufferSize > config.getUploadLimit(),
        sizeLimit: config.getUploadLimit()
    }
}

export async function uploadAttachment(attachment: Attachment, fileRoot = 'gcodes', filePath = '') {
    try {
        logNotice(`Upload for ${attachment.name} started`)
        const attachmentData = await axios.get(attachment.url,
            {responseType: 'arraybuffer'})

        const formData = new FormData()
        const configHelper = new ConfigHelper()

        formData.append('file', attachmentData.data, attachment.name)
        formData.append('root', fileRoot)
        formData.append('path', filePath)

        await axios.post(`${configHelper.getMoonrakerUrl()}/server/files/upload`,
            formData,
            {
                'maxContentLength': Infinity,
                'maxBodyLength': Infinity,
                headers: {
                    'X-Api-Key': configHelper.getMoonrakerApiKey(),
                    'Content-Type': `multipart/form-data; boundary=${formData['_boundary']}`
                }
            })
        return true
    } catch (error) {
        logError(`Upload for ${attachment.name} failed:`)
        logError(error)
        return false
    }
}