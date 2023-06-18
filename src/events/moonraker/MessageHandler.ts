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
import {PowerDeviceHelper} from "../../helper/PowerDeviceHelper";

export class MessageHandler {
    protected websocket: Websocket

    protected timelapseMacroNotification = new TimelapseMacroNotification()
    protected subscriptionNotification = new SubscriptionNotification()
    protected consoleMessage = new ConsoleMessage()
    protected procStatsNotification = new ProcStatsNotification()
    protected updateNotification = new UpdateNotification()
    protected fileEditNotification = new FileEditNotification()
    protected stateUpdateNotification = new StateUpdateNotification()
    protected gcodeResponseNotification = new GcodeResponseNotification()
    protected throttleNotification = new ThrottleNotification()
    protected timelapseNotification = new TimelapseNotification()
    protected displayUpdateNotification = new DisplayUpdateNotification()
    protected printProgressNotification = new PrintProgressNotification()
    protected powerDeviceNotification = new PowerDeviceNotification()

    public constructor(websocket: Websocket) {
        this.websocket = websocket

        websocket.addEventListener(WebsocketEvents.message, ((instance, ev) => {
            const messageData = JSON.parse(ev.data)

            if (typeof (messageData) === 'undefined') {
                return
            }

            updateData('moonraker_client', {
                'event_count': websocket.underlyingWebsocket['_eventsCount']
            })

            void this.timelapseMacroNotification.parse(messageData)
            void this.subscriptionNotification.parse(messageData)
            void this.consoleMessage.parse(messageData)
            void this.procStatsNotification.parse(messageData)
            void this.updateNotification.parse(messageData)
            void this.fileEditNotification.parse(messageData)
            void this.stateUpdateNotification.parse(messageData)
            void this.gcodeResponseNotification.parse(messageData)
            void this.throttleNotification.parse(messageData)
            void this.timelapseNotification.parse(messageData)
            void this.displayUpdateNotification.parse(messageData)
            void this.printProgressNotification.parse(messageData)
            void this.powerDeviceNotification.parse(messageData)
        }))
    }
}