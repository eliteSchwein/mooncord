'use strict'

import {ConfigHelper} from "../ConfigHelper";
import {getEntry} from "../../utils/CacheUtil";
import {logRegular} from "../LoggerHelper";
import sharp from "sharp";
import {AttachmentBuilder} from "discord.js";
import NoneRenderBackend from "../snapshotBackend/NoneRenderBackend";
import JimpRenderBackend from "../snapshotBackend/JimpRenderBackend";
import GraphicsMagickRenderBackend from "../snapshotBackend/GraphicsMagickRenderBackend";
import SharpRenderBackend from "../snapshotBackend/SharpRenderBackend";
import BaseGraph from "./BaseGraph";

export class ExcludeGraph extends BaseGraph {
    filename = 'excludeGraph.png'

    public async renderGraph(currentObject: string) {
        const stateCache = getEntry('state')
        const excludeObjects = stateCache.exclude_object.objects
        const excludedObjects = stateCache.exclude_object.excluded_objects
        const axisMaximum = stateCache.toolhead.axis_maximum
        const colors = this.config.getColors(/exclude.*/g, true)

        logRegular('render exclude object graph...')

        let svg = `<svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 ${axisMaximum[0]} ${axisMaximum[1]}">
            <rect x="0" y="0" width="${axisMaximum[0]}" height="${axisMaximum[1]}" fill="#${colors.exclude_background.color}"/>
        `

        for (const excludeObject of excludeObjects) {
            const polygons = excludeObject.polygon.join(' ')
            let color = `#${colors.exclude_inactive.color}`

            if (excludedObjects.includes(excludeObject.name)) {
                color = `#${colors.exclude_excluded.color}`
            }
            if (excludeObject.name === currentObject) {
                color = `#${colors.exclude_active.color}`
            }

            svg = `
${svg}
    <polygon points="${polygons}" fill="${color}" stroke="#${colors.exclude_border.color}"/>
            `
        }

        svg = `
${svg}
</svg>
`
        return await this.convertSvg(svg)
    }
}