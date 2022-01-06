import {Websocket, WebsocketEvents} from "websocket-ts";
import {ProcStatsNotification} from "./messages/ProcStatsNotification";
import {SubscriptionNotification} from "./messages/SubscriptionNotification";
import {UpdateNotification} from "./messages/UpdateNotification";
import {updateData} from "../../utils/CacheUtil";
import {FileEditNotification} from "./messages/FileEditNotification";
import {StateUpdateNotification} from "./messages/StateUpdateNotification";
import {GcodeResponseNotification} from "./messages/GcodeResponseNotification";
import { PrintProgressNotification } from "./messages/PrintProgressNotification";
import {ThrottleNotification} from "./messages/ThrottleNotification";
import {TimelapseNotification} from "./messages/TimelapseNotification";

export class MessageHandler {
    protected websocket: Websocket

    public constructor(websocket: Websocket) {
        this.websocket = websocket

        websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if(typeof(messageData) === 'undefined') { return }

            updateData('moonraker_client', {
                'event_count': websocket.underlyingWebsocket['_eventsCount']
            })

            void new ProcStatsNotification().parse(messageData)
            void new SubscriptionNotification().parse(messageData)
            void new UpdateNotification().parse(messageData)
            void new FileEditNotification().parse(messageData)
            void new StateUpdateNotification().parse(messageData)
            void new GcodeResponseNotification().parse(messageData)
            void new PrintProgressNotification().parse(messageData)
            void new ThrottleNotification().parse(messageData)
            void new TimelapseNotification().parse(messageData)
        }))
    }
}