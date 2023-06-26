'use strict'

import {Websocket, WebsocketEvents} from "websocket-ts";
import {ProcStatsNotification} from "./messages/ProcStatsNotification";
import {SubscriptionNotification} from "./messages/SubscriptionNotification";
import {UpdateNotification} from "./messages/UpdateNotification";
import {updateData} from "../../utils/CacheUtil";
import {FileEditNotification} from "./messages/FileEditNotification";
import {StateUpdateNotification} from "./messages/StateUpdateNotification";
import {GcodeResponseNotification} from "./messages/GcodeResponseNotification";
import {PrintProgressNotification} from "./messages/PrintProgressNotification";
import {ThrottleNotification} from "./messages/ThrottleNotification";
import {TimelapseNotification} from "./messages/TimelapseNotification";
import {DisplayUpdateNotification} from "./messages/DisplayUpdateNotification";
import {ConsoleMessage} from "./gcode-messages/ConsoleMessage";
import {TimelapseMacroNotification} from "./messages/TimelapseMacroNotification";
import {PowerDeviceNotification} from "./messages/PowerDeviceNotification";

export class MessageHandler {

    public constructor(websocket: Websocket) {
        websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if (typeof (messageData) === 'undefined') {
                return
            }

            updateData('moonraker_client', {
                'event_count': websocket.underlyingWebsocket['_eventsCount']
            })

            void new TimelapseMacroNotification().parse(messageData)
            void new SubscriptionNotification().parse(messageData)
            void new ConsoleMessage().parse(messageData)
            void new ProcStatsNotification().parse(messageData)
            void new UpdateNotification().parse(messageData)
            void new FileEditNotification().parse(messageData)
            void new StateUpdateNotification().parse(messageData)
            void new GcodeResponseNotification().parse(messageData)
            void new ThrottleNotification().parse(messageData)
            void new TimelapseNotification().parse(messageData)
            void new DisplayUpdateNotification().parse(messageData)
            void new PrintProgressNotification().parse(messageData)
            void new PowerDeviceNotification().parse(messageData)
        }))
    }
}