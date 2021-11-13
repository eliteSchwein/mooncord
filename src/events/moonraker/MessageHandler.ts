import {Websocket, WebsocketEvents} from "websocket-ts";
import {ProcStatsNotification} from "./messages/ProcStatsNotification";
import {SubscriptionNotification} from "./messages/SubscriptionNotification";
import {UpdateNotification} from "./messages/UpdateNotification";
import {updateData} from "../../utils/CacheUtil";
import {FileEditNotification} from "./messages/FileEditNotification";
import {StateUpdateNotification} from "./messages/StateUpdateNotification";
import {GcodeResponseNotification} from "./messages/GcodeResponseNotification";

export class MessageHandler {
    protected websocket: Websocket

    protected procStatsNotification = new ProcStatsNotification()
    protected subscriptionNotification = new SubscriptionNotification()
    protected updateNotification = new UpdateNotification()
    protected fileEditNotification = new FileEditNotification()
    protected stateUpdateNotification = new StateUpdateNotification()
    protected gcodeResponseNotification = new GcodeResponseNotification()

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
            this.gcodeResponseNotification.parse(messageData)
        }))
    }
}