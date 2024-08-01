'use strict'

import {PromptHelper} from "../../../helper/PromptHelper";

export class PromptMessage {

    public async execute(message: string) {
        if (!message.startsWith('// action:prompt_')) {
            return
        }
        const content = message.replace('// action:prompt_', '')
        const promptHelper = new PromptHelper()

        promptHelper.addComponent(content)
    }
}