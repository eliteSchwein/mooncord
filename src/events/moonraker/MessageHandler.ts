'use strict'

import {Websocket, WebsocketEvent} from "websocket-ts";
import {ProcStatsNotification} from "./messages/ProcStatsNotification";
import {SubscriptionNotification} from "./messages/SubscriptionNotification";
import {UpdateNotification} from "./messages/UpdateNotification";
import {getEntry, setData, updateData} from "../../utils/CacheUtil";
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
import {removeFromArray} from "../../helper/DataHelper";

export class MessageHandler {

    public constructor(websocket: Websocket) {
        websocket.addEventListener(WebsocketEvent.message, (async (instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if (typeof (messageData) === 'undefined') {
                return
            }

            const websocketCache = getEntry('websocket')
            const blockedMethods = websocketCache.blocked

            if(messageData.method && blockedMethods && blockedMethods.includes(messageData.method)) {
                removeFromArray(blockedMethods, messageData.method)

                websocketCache.blocked = blockedMethods
                setData('websocket', websocketCache)
                return
            }

            //console.log(messageData)

            updateData('moonraker_client', {
                'event_count': websocket.underlyingWebsocket['_eventsCount']
            })

            // sync events
            new ProcStatsNotification().parse(messageData)
            new FileEditNotification().parse(messageData)
            new PowerDeviceNotification().parse(messageData)

            // async events
            await new SubscriptionNotification().parse(messageData)
            if(await new TimelapseMacroNotification().parse(messageData))
                return
            if(await new ConsoleMessage().parse(messageData))
                return
            if(await new StateUpdateNotification().parse(messageData))
                return
            if(await new TimelapseNotification().parse(messageData))
                return
            if(await new DisplayUpdateNotification().parse(messageData))
                return
            if(await new PrintProgressNotification().parse(messageData))
                return
            if(await new GcodeResponseNotification().parse(messageData))
                return
            if(await new ThrottleNotification().parse(messageData))
                return
            if(await new UpdateNotification().parse(messageData))
                return
        }))
    }
}