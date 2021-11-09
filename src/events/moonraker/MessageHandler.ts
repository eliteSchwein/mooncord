import {Websocket, WebsocketEvents} from "websocket-ts";
import {ProcStatsNotification} from "./messages/ProcStatsNotification";
import {SubscriptionNotification} from "./messages/SubscriptionNotification";
import {UpdateNotification} from "./messages/UpdateNotification";
import {updateData} from "../../utils/CacheUtil";
import {FileEditNotification} from "./messages/FileEditNotification";
import {StateUpdateNotification} from "./messages/StateUpdateNotification";

export class MessageHandler {
    protected websocket: Websocket

    protected procStatsNotification = new ProcStatsNotification()
    protected subscriptionNotification = new SubscriptionNotification()
    protected updateNotification = new UpdateNotification()
    protected fileEditNotification = new FileEditNotification()
    protected stateUpdateNotification = new StateUpdateNotification()

    public constructor(websocket: Websocket) {
        this.websocket = websocket

        websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if(typeof(messageData) === 'undefined') { return }

            updateData('moonraker_client', {
                'event_count': websocket.underlyingWebsocket['_eventsCount']
            })

            //console.log(messageData)

            this.procStatsNotification.parse(messageData)
            this.subscriptionNotification.parse(messageData)
            this.updateNotification.parse(messageData)
            this.fileEditNotification.parse(messageData)
            this.stateUpdateNotification.parse(messageData)
        }))
    }
}