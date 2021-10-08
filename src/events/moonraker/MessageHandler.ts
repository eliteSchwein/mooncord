import {Websocket, WebsocketEvents} from "websocket-ts";
import {ProcStatsUpdate} from "./messages/ProcStatsUpdate";
import {SubscriptionUpdate} from "./messages/SubscriptionUpdate";

export class MessageHandler {
    protected websocket: Websocket

    protected procStatsUpdate = new ProcStatsUpdate()
    protected subscriptionUpdate = new SubscriptionUpdate()

    public constructor(websocket: Websocket) {
        this.websocket = websocket

        websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if(typeof(messageData) === 'undefined') { return }

            if(this.procStatsUpdate.parse(messageData)) { return }
            if(this.subscriptionUpdate.parse(messageData)) { return }

            console.log(messageData)
        }))
    }
}