import {EmbedHelper} from "../../../helper/EmbedHelper";

export class M117Message {
    protected embedHelper = new EmbedHelper()

    public async execute(message: string) {
        if(!message.startsWith('M117')) { return }
        if(message.length < 3) { return }

        const notificationMessage = message.slice(4)

        console.log(notificationMessage)
    }
}